<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plan;
use App\Models\PlanDownload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
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

        return response()->json($orders);
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
                'message' => 'Aucun plan achetable dans la sélection.',
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

        return response()->json([
            'message' => 'Commande créée. Paiement FedaPay en attente.',
            'order' => $order->load([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ]),
        ], 201);
    }

    public function simulateFedapay(Request $request, Order $order): JsonResponse
    {
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès refusé.',
            ], 403);
        }

        if ($order->payment_status !== 'pending') {
            return response()->json([
                'message' => 'La commande n\'est pas en attente de paiement.',
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

            return response()->json([
                'message' => 'Paiement FedaPay simulé avec succès. Téléchargements activés.',
                'order' => $order->fresh()->load([
                    'items.plan:id,title,slug,price_cents,currency',
                    'items.download:id,order_item_id,token,expires_at,downloaded_at',
                ]),
            ]);
        }

        $order->update([
            'payment_status' => 'failed',
            'payment_provider' => 'fedapay',
            'payment_reference' => 'FDPAY-FAIL-'.strtoupper(Str::random(12)),
        ]);

        return response()->json([
            'message' => 'Échec de paiement FedaPay simulé.',
            'order' => $order->fresh()->load([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ]),
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
                'message' => 'Accès refusé.',
            ], 403);
        }

        if (! in_array($order->payment_status, ['pending', 'paid'], true)) {
            return response()->json([
                'message' => 'Cette commande ne peut plus être annulée.',
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

        return response()->json([
            'message' => 'Commande annulée avec succès.',
            'order' => $order->fresh()->load([
                'items.plan:id,title,slug,price_cents,currency',
                'items.download:id,order_item_id,token,expires_at,downloaded_at',
            ]),
        ]);
    }
}
