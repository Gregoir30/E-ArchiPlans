<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plan;
use App\Models\PlanDownload;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('buyer_id', $request->user()->id)
            ->with([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ])
            ->latest()
            ->paginate(15);

        return response()->json($this->appendSignedDownloadUrlsToPaginator($orders));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_ids' => ['required', 'array', 'min:1'],
            'plan_ids.*' => ['integer', 'exists:plans,id'],
        ]);

        $plans = Plan::query()
            ->whereIn('id', $validated['plan_ids'])
            ->where('status', 'approved')
            ->get();

        if ($plans->isEmpty()) {
            return response()->json([
                'message' => 'Aucun plan achetable dans la selection.',
            ], 422);
        }

        $order = DB::transaction(function () use ($request, $plans): Order {
            $total = (int) $plans->sum('price_cents');

            $order = Order::query()->create([
                'buyer_id' => $request->user()->id,
                'total_cents' => $total,
                'currency' => 'USD',
                'payment_status' => 'pending',
                'payment_provider' => 'fedapay',
                'payment_reference' => 'FDPAY-PENDING-'.strtoupper(Str::random(10)),
            ]);

            foreach ($plans as $plan) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'plan_id' => $plan->id,
                    'unit_price_cents' => $plan->price_cents,
                ]);
            }

            return $order;
        });

        $this->auditLogService->log(
            action: 'order.created',
            userId: $request->user()->id,
            auditableType: Order::class,
            auditableId: $order->id,
            metadata: ['plans_count' => $plans->count()],
            request: $request
        );

        return response()->json([
            'message' => 'Commande creee. Paiement FedaPay en attente.',
            'order' => $this->appendSignedDownloadUrlsToOrder($order->load([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ])),
        ], 201);
    }

    public function simulateFedapay(Request $request, Order $order): JsonResponse
    {
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Acces refuse.',
            ], 403);
        }

        if ($order->payment_status !== 'pending') {
            return response()->json([
                'message' => 'La commande n est pas en attente de paiement.',
            ], 422);
        }

        $validated = $request->validate([
            'outcome' => ['required', 'in:success,failure'],
        ]);

        if ($validated['outcome'] === 'success') {
            DB::transaction(function () use ($order): void {
                $order->update([
                    'payment_status' => 'paid',
                    'payment_provider' => 'fedapay',
                    'payment_reference' => 'FDPAY-SIM-'.strtoupper(Str::random(12)),
                ]);

                $order->load('items');

                foreach ($order->items as $item) {
                    PlanDownload::query()->firstOrCreate(
                        ['order_item_id' => $item->id],
                        [
                            'token' => Str::uuid()->toString(),
                            'expires_at' => now()->addDays(7),
                            'downloaded_at' => null,
                        ]
                    );
                }
            });

            $this->auditLogService->log(
                action: 'order.payment.simulated_success',
                userId: $request->user()->id,
                auditableType: Order::class,
                auditableId: $order->id,
                request: $request
            );

            return response()->json([
                'message' => 'Paiement FedaPay simule avec succes. Telechargements actives.',
                'order' => $this->appendSignedDownloadUrlsToOrder($order->fresh()->load([
                    'items.plan:id,title,slug,price_cents,currency',
                    'items.download:id,order_item_id,token,expires_at,downloaded_at',
                ])),
            ]);
        }

        $order->update([
            'payment_status' => 'failed',
            'payment_provider' => 'fedapay',
            'payment_reference' => 'FDPAY-FAIL-'.strtoupper(Str::random(12)),
        ]);

        $this->auditLogService->log(
            action: 'order.payment.simulated_failure',
            userId: $request->user()->id,
            auditableType: Order::class,
            auditableId: $order->id,
            request: $request
        );

        return response()->json([
            'message' => 'Echec de paiement FedaPay simule.',
            'order' => $this->appendSignedDownloadUrlsToOrder($order->fresh()->load([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ])),
        ]);
    }

    public function simulatePaymentSuccess(Request $request, Order $order): JsonResponse
    {
        $request->merge(['outcome' => 'success']);

        return $this->simulateFedapay($request, $order);
    }

    public function simulatePaymentFailure(Request $request, Order $order): JsonResponse
    {
        $request->merge(['outcome' => 'failure']);

        return $this->simulateFedapay($request, $order);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Acces refuse.',
            ], 403);
        }

        if (! in_array($order->payment_status, ['pending', 'paid'], true)) {
            return response()->json([
                'message' => 'Cette commande ne peut plus etre annulee.',
            ], 422);
        }

        DB::transaction(function () use ($order): void {
            $order->update([
                'payment_status' => 'refunded',
            ]);

            PlanDownload::query()
                ->whereIn('order_item_id', $order->items()->pluck('id'))
                ->update([
                    'expires_at' => now(),
                ]);
        });

        $this->auditLogService->log(
            action: 'order.cancelled',
            userId: $request->user()->id,
            auditableType: Order::class,
            auditableId: $order->id,
            request: $request
        );

        return response()->json([
            'message' => 'Commande annulee avec succes.',
            'order' => $this->appendSignedDownloadUrlsToOrder($order->fresh()->load([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ])),
        ]);
    }

    public function cart(Request $request): JsonResponse
    {
        $pendingOrder = Order::query()
            ->where('buyer_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->withCount('items')
            ->latest('created_at')
            ->first();

        return response()->json([
            'items_count' => $pendingOrder?->items_count ?? 0,
        ]);
    }

    private function appendSignedDownloadUrlsToPaginator(LengthAwarePaginator $paginator): LengthAwarePaginator
    {
        $paginator->getCollection()->transform(function (Order $order): Order {
            return $this->appendSignedDownloadUrlsToOrder($order);
        });

        return $paginator;
    }

    private function appendSignedDownloadUrlsToOrder(Order $order): Order
    {
        if (! $order->relationLoaded('items')) {
            return $order;
        }

        $order->items->each(function (OrderItem $item): void {
            if (! $item->relationLoaded('download')) {
                return;
            }

            if (! $item->download?->token) {
                return;
            }

            $item->download->setAttribute(
                'signed_url',
                URL::temporarySignedRoute(
                    'downloads.secure',
                    now()->addMinutes(10),
                    ['token' => $item->download->token],
                    false
                )
            );
        });

        return $order;
    }
}
