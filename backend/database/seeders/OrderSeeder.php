<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plan;
use App\Models\PlanDownload;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $buyerIds = User::query()->where('role', 'buyer')->pluck('id');
        $plans = Plan::query()->where('status', 'approved')->get();

        if ($buyerIds->isEmpty() || $plans->isEmpty()) {
            return;
        }

        Order::factory()
            ->count(25)
            ->make()
            ->each(function (Order $order) use ($buyerIds, $plans): void {
                $order->buyer_id = $buyerIds->random();
                $order->save();

                $selectedPlans = $plans->random(random_int(1, min(3, $plans->count())));
                $items = [];
                $total = 0;

                foreach ($selectedPlans as $plan) {
                    $price = $plan->price_cents;
                    $item = OrderItem::query()->create([
                        'order_id' => $order->id,
                        'plan_id' => $plan->id,
                        'unit_price_cents' => $price,
                    ]);
                    $items[] = $item;
                    $total += $price;
                }

                $order->update(['total_cents' => $total]);

                if ($order->payment_status === 'paid') {
                    foreach ($items as $item) {
                        PlanDownload::query()->create([
                            'order_item_id' => $item->id,
                            'token' => Str::uuid()->toString(),
                            'expires_at' => now()->addDays(7),
                            'downloaded_at' => null,
                        ]);
                    }
                }
            });
    }
}

