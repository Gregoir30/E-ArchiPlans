<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PlanDownload>
 */
class PlanDownloadFactory extends Factory
{
    public function definition(): array
    {
        $downloadedAt = fake()->boolean(30) ? now()->subDays(fake()->numberBetween(0, 10)) : null;

        return [
            'order_item_id' => OrderItem::factory(),
            'token' => Str::uuid()->toString(),
            'expires_at' => now()->addDays(fake()->numberBetween(1, 14)),
            'downloaded_at' => $downloadedAt,
        ];
    }
}

