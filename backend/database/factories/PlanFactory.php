<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    public function definition(): array
    {
        $title = ucfirst(fake()->words(4, true));

        return [
            'seller_id' => User::factory()->seller(),
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraph(),
            'price_cents' => fake()->numberBetween(8000, 350000),
            'currency' => 'USD',
            'status' => fake()->randomElement(['draft', 'pending', 'approved']),
            'cover_image_path' => 'covers/'.Str::slug($title).'.jpg',
            'file_path' => 'plans/'.Str::slug($title).'.pdf',
        ];
    }
}

