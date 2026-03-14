<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const ADMIN_EMAIL = 'admin@earchiplans.test';
    private const ADMIN_NAME = 'Admin E-ArchiPlans';
    private const SELLER_EMAIL = 'seller@earchiplans.test';
    private const SELLER_NAME = 'Vendeur E-ArchiPlans';

    private function insertUser(string $email, string $name, string $role, string $password, bool $withToken = false): void
    {
        if (DB::table('users')->where('email', $email)->exists()) {
            return;
        }

        $payload = [
            'name' => $name,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make($password),
            'role' => $role,
            'is_active' => true,
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if ($withToken) {
            $token = Str::random(60);
            $payload['api_token'] = hash('sha256', $token);
        }

        DB::table('users')->insert($payload);
    }

    public function up(): void
    {
        $this->insertUser(self::ADMIN_EMAIL, self::ADMIN_NAME, 'admin', 'password123', true);
        $this->insertUser(self::SELLER_EMAIL, self::SELLER_NAME, 'seller', 'seller123');
    }

    public function down(): void
    {
        DB::table('users')->whereIn('email', [self::ADMIN_EMAIL, self::SELLER_EMAIL])->delete();
    }
};
