<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function seller(Request $request): JsonResponse
    {
        $user = $request->user();

        $plansTotal = Plan::query()->where('seller_id', $user->id)->count();

        $plansByStatus = Plan::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->where('seller_id', $user->id)
            ->groupBy('status')
            ->pluck('total', 'status');

        $soldItemsCount = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('plans', 'plans.id', '=', 'order_items.plan_id')
            ->where('plans.seller_id', $user->id)
            ->where('orders.payment_status', 'paid')
            ->count();

        $revenueCents = (int) OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('plans', 'plans.id', '=', 'order_items.plan_id')
            ->where('plans.seller_id', $user->id)
            ->where('orders.payment_status', 'paid')
            ->sum('order_items.unit_price_cents');

        $ordersCount = Order::query()
            ->whereExists(function ($query) use ($user): void {
                $query->select(DB::raw(1))
                    ->from('order_items')
                    ->join('plans', 'plans.id', '=', 'order_items.plan_id')
                    ->whereColumn('order_items.order_id', 'orders.id')
                    ->where('plans.seller_id', $user->id);
            })
            ->where('payment_status', 'paid')
            ->count();

        $recentPlans = Plan::query()
            ->with('category:id,name')
            ->where('seller_id', $user->id)
            ->latest()
            ->take(6)
            ->get(['id', 'category_id', 'title', 'status', 'price_cents', 'currency', 'created_at']);

        $recentSales = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('plans', 'plans.id', '=', 'order_items.plan_id')
            ->join('users as buyers', 'buyers.id', '=', 'orders.buyer_id')
            ->where('plans.seller_id', $user->id)
            ->where('orders.payment_status', 'paid')
            ->orderByDesc('orders.created_at')
            ->take(8)
            ->get([
                'orders.id as order_id',
                'orders.created_at as ordered_at',
                'buyers.name as buyer_name',
                'plans.title as plan_title',
                'order_items.unit_price_cents',
            ]);

        return response()->json([
            'summary' => [
                'plans_total' => $plansTotal,
                'plans_by_status' => [
                    'draft' => (int) ($plansByStatus['draft'] ?? 0),
                    'pending' => (int) ($plansByStatus['pending'] ?? 0),
                    'approved' => (int) ($plansByStatus['approved'] ?? 0),
                    'rejected' => (int) ($plansByStatus['rejected'] ?? 0),
                ],
                'orders_count' => $ordersCount,
                'sold_items_count' => $soldItemsCount,
                'revenue_cents' => $revenueCents,
                'currency' => 'XAF',
            ],
            'recent_plans' => $recentPlans,
            'recent_sales' => $recentSales,
        ]);
    }

    public function sellerPlans(Request $request): JsonResponse
    {
        $user = $request->user();

        $plans = Plan::query()
            ->with(['category:id,name,slug'])
            ->where('seller_id', $user->id)
            ->latest('created_at')
            ->get();

        return PlanResource::collection($plans)->response();
    }

    public function admin(): JsonResponse
    {
        $usersTotal = User::query()->count();
        $sellersTotal = User::query()->where('role', 'seller')->count();
        $buyersTotal = User::query()->where('role', 'buyer')->count();

        $plansTotal = Plan::query()->count();
        $plansPending = Plan::query()->where('status', 'pending')->count();

        $ordersTotal = Order::query()->count();
        $ordersPaid = Order::query()->where('payment_status', 'paid')->count();
        $ordersPending = Order::query()->where('payment_status', 'pending')->count();
        $revenueCents = (int) Order::query()->where('payment_status', 'paid')->sum('total_cents');

        $contactMessagesTotal = ContactMessage::query()->count();

        $recentOrders = Order::query()
            ->with('buyer:id,name,email')
            ->latest()
            ->take(8)
            ->get(['id', 'buyer_id', 'total_cents', 'currency', 'payment_status', 'created_at']);

        $pendingPlans = Plan::query()
            ->with(['seller:id,name,email', 'category:id,name'])
            ->where('status', 'pending')
            ->latest()
            ->take(8)
            ->get(['id', 'seller_id', 'category_id', 'title', 'price_cents', 'currency', 'created_at']);

        $recentUsers = User::query()
            ->latest()
            ->take(8)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return response()->json([
            'summary' => [
                'users_total' => $usersTotal,
                'sellers_total' => $sellersTotal,
                'buyers_total' => $buyersTotal,
                'plans_total' => $plansTotal,
                'plans_pending' => $plansPending,
                'orders_total' => $ordersTotal,
                'orders_paid' => $ordersPaid,
                'orders_pending' => $ordersPending,
                'revenue_cents' => $revenueCents,
                'currency' => 'XAF',
                'contact_messages_total' => $contactMessagesTotal,
            ],
            'recent_orders' => $recentOrders,
            'pending_plans' => $pendingPlans,
            'recent_users' => $recentUsers,
        ]);
    }
}
