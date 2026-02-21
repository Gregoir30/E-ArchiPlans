<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginLogoutApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_logs_in_and_returns_a_token(): void
    {
        $user = User::factory()->seller()->create([
            'email' => 'seller@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'seller@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Connexion reussie.')
            ->assertJsonPath('user.id', $user->id);

        $this->assertNotNull($user->fresh()->api_token);
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'buyer@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'buyer@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Identifiants invalides.');
    }

    public function test_it_logs_out_and_clears_token(): void
    {
        $user = User::factory()->seller()->create([
            'api_token' => 'token-test-logout',
        ]);

        $response = $this->postJson('/api/logout', [], [
            'Authorization' => 'Bearer token-test-logout',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Deconnexion reussie.');

        $this->assertNull($user->fresh()->api_token);
    }

    public function test_it_returns_current_authenticated_user(): void
    {
        $user = User::factory()->seller()->create([
            'api_token' => 'token-test-me',
        ]);

        $response = $this->getJson('/api/me', [
            'Authorization' => 'Bearer token-test-me',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }
}
