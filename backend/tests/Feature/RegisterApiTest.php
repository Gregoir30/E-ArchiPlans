<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_user(): void
    {
        $payload = [
            'name' => 'New Seller',
            'email' => 'new.seller@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'seller',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('message', 'Compte cree avec succes.')
            ->assertJsonPath('user.email', 'new.seller@example.com')
            ->assertJsonPath('user.role', 'seller');

        $response->assertJsonStructure([
            'message',
            'token',
            'user' => ['id', 'name', 'email', 'role'],
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'new.seller@example.com',
            'role' => 'seller',
        ]);
    }

    public function test_it_validates_register_payload(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }
}
