<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $sellerIds = User::query()->where('role', 'seller')->pluck('id');
        $categoryIds = Category::query()->pluck('id');

        if ($sellerIds->isEmpty() || $categoryIds->isEmpty()) {
            return;
        }

        Plan::factory()
            ->count(40)
            ->make()
            ->each(function (Plan $plan) use ($sellerIds, $categoryIds): void {
                $plan->seller_id = $sellerIds->random();
                $plan->category_id = $categoryIds->random();
                $plan->save();
            });
    }
}

