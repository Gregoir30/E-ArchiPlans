<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin E-ArchiPlans',
            'email' => 'admin@earchiplans.test',
        ]);

        User::factory()->seller()->count(8)->create();
        User::factory()->count(20)->create();
    }
}

