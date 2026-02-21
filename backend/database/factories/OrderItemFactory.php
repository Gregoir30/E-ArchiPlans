<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'plan_id' => Plan::factory(),
            'unit_price_cents' => fake()->numberBetween(8000, 350000),
        ];
    }
}

