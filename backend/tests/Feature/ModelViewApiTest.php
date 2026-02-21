<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelViewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_model_view_endpoints(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
        $this->getJson('/api/categories')->assertUnauthorized();
        $this->getJson('/api/orders')->assertUnauthorized();
        $this->getJson('/api/order-items')->assertUnauthorized();
        $this->getJson('/api/plan-downloads')->assertUnauthorized();
        $this->getJson('/api/contact-messages')->assertUnauthorized();
    }

    public function test_authenticated_user_can_access_model_view_endpoints(): void
    {
        $user = User::factory()->create([
            'api_token' => 'token-model-view',
        ]);

        $headers = ['Authorization' => 'Bearer token-model-view'];

        $this->getJson('/api/users', $headers)->assertOk();
        $this->getJson('/api/categories', $headers)->assertOk();
        $this->getJson('/api/orders', $headers)->assertOk();
        $this->getJson('/api/order-items', $headers)->assertOk();
        $this->getJson('/api/plan-downloads', $headers)->assertOk();
        $this->getJson('/api/contact-messages', $headers)->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }
}

