<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'paid', 'failed', 'refunded']);

        return [
            'buyer_id' => User::factory(),
            'total_cents' => fake()->numberBetween(15000, 500000),
            'currency' => 'XAF',
            'payment_status' => $status,
            'payment_provider' => $status === 'pending' ? null : fake()->randomElement(['stripe', 'paypal']),
            'payment_reference' => $status === 'pending' ? null : strtoupper(fake()->bothify('PAY-####??##')),
        ];
    }
}
