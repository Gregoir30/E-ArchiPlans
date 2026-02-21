<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderAndDownloadApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_order_and_download_token_for_authenticated_user(): void
    {
        Storage::fake('local');

        $buyer = User::factory()->create(['api_token' => 'token-buyer']);
        $seller = User::factory()->seller()->create();
        $category = Category::factory()->create();
        $plan = Plan::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'status' => 'approved',
        ]);

        $response = $this->postJson('/api/orders', [
            'plan_ids' => [$plan->id],
        ], [
            'Authorization' => 'Bearer token-buyer',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Commande creee avec succes.')
            ->assertJsonPath('order.items.0.plan.id', $plan->id);
    }

    public function test_it_downloads_plan_file_from_token(): void
    {
        Storage::fake('local');

        $buyer = User::factory()->create(['api_token' => 'token-download']);
        $seller = User::factory()->seller()->create();
        $category = Category::factory()->create();
        $plan = Plan::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'status' => 'approved',
            'file_path' => 'plans/files/sample.pdf',
        ]);

        Storage::disk('local')->put('plans/files/sample.pdf', 'fake-pdf-content');

        $orderResponse = $this->postJson('/api/orders', [
            'plan_ids' => [$plan->id],
        ], [
            'Authorization' => 'Bearer token-download',
        ]);

        $token = $orderResponse->json('order.items.0.download.token');
        $downloadResponse = $this->get('/api/downloads/'.$token, [
            'Authorization' => 'Bearer token-download',
        ]);

        $downloadResponse->assertOk();
    }

    public function test_it_cancels_own_order(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->seller()->create();
        $category = Category::factory()->create();
        $plan = Plan::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'status' => 'approved',
        ]);

        $this->actingAs($buyer, 'api');
        $orderResponse = $this->postJson('/api/orders', [
            'plan_ids' => [$plan->id],
        ]);

        $orderId = $orderResponse->json('order.id');
        $cancelResponse = $this->postJson('/api/orders/'.$orderId.'/cancel');

        $cancelResponse->assertOk()
            ->assertJsonPath('message', 'Commande annulee avec succes.')
            ->assertJsonPath('order.payment_status', 'refunded');
    }

    public function test_user_cannot_cancel_another_user_order(): void
    {
        $buyer = User::factory()->create();
        $other = User::factory()->create();
        $seller = User::factory()->seller()->create();
        $category = Category::factory()->create();
        $plan = Plan::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'status' => 'approved',
        ]);

        $this->actingAs($buyer, 'api');
        $orderResponse = $this->postJson('/api/orders', [
            'plan_ids' => [$plan->id],
        ]);

        $orderId = $orderResponse->json('order.id');
        $this->actingAs($other, 'api');
        $cancelResponse = $this->postJson('/api/orders/'.$orderId.'/cancel');

        $cancelResponse->assertForbidden();
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => 'paid',
        ]);
    }
}
