<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PlanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_plan_and_uploads_files(): void
    {
        Storage::fake('local');

        $seller = User::factory()->seller()->create();
        $this->actingAs($seller, 'api');
        $category = Category::factory()->create();

        $payload = [
            'category_id' => $category->id,
            'title' => 'Villa moderne 4 chambres',
            'slug' => 'villa-moderne-4-chambres',
            'description' => 'Plan detaille avec parking et terrasse.',
            'price_cents' => 125000,
            'currency' => 'XAF',
            'status' => 'approved',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
            'plan_file' => UploadedFile::fake()->create('plan.pdf', 300, 'application/pdf'),
        ];

        $response = $this->post('/api/plans', $payload, ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('slug', 'villa-moderne-4-chambres');

        $plan = Plan::query()->firstOrFail();
        $this->assertNotNull($plan->cover_image_path);
        $this->assertNotNull($plan->file_path);
        Storage::disk('local')->assertExists($plan->cover_image_path);
        Storage::disk('local')->assertExists($plan->file_path);
    }

    public function test_it_updates_plan_and_replaces_files(): void
    {
        Storage::fake('local');

        $seller = User::factory()->seller()->create();
        $this->actingAs($seller, 'api');
        $category = Category::factory()->create();

        Storage::disk('local')->put('plans/covers/old-cover.jpg', 'old');
        Storage::disk('local')->put('plans/files/old-plan.pdf', 'old');

        $plan = Plan::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'cover_image_path' => 'plans/covers/old-cover.jpg',
            'file_path' => 'plans/files/old-plan.pdf',
        ]);

        $payload = [
            '_method' => 'PUT',
            'title' => 'Villa premium renovee',
            'cover_image' => UploadedFile::fake()->image('new-cover.jpg'),
            'plan_file' => UploadedFile::fake()->create('new-plan.pdf', 500, 'application/pdf'),
        ];

        $response = $this->post('/api/plans/'.$plan->id, $payload, ['Accept' => 'application/json']);

        $response->assertOk()
            ->assertJsonPath('title', 'Villa premium renovee');

        $plan->refresh();
        Storage::disk('local')->assertMissing('plans/covers/old-cover.jpg');
        Storage::disk('local')->assertMissing('plans/files/old-plan.pdf');
        Storage::disk('local')->assertExists($plan->cover_image_path);
        Storage::disk('local')->assertExists($plan->file_path);
    }

    public function test_it_deletes_plan_and_uploaded_files(): void
    {
        Storage::fake('local');

        $seller = User::factory()->seller()->create();
        $this->actingAs($seller, 'api');
        $category = Category::factory()->create();

        Storage::disk('local')->put('plans/covers/delete-cover.jpg', 'old');
        Storage::disk('local')->put('plans/files/delete-plan.pdf', 'old');

        $plan = Plan::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'cover_image_path' => 'plans/covers/delete-cover.jpg',
            'file_path' => 'plans/files/delete-plan.pdf',
        ]);

        $response = $this->deleteJson('/api/plans/'.$plan->id);

        $response->assertNoContent();
        $this->assertDatabaseMissing('plans', ['id' => $plan->id]);
        Storage::disk('local')->assertMissing('plans/covers/delete-cover.jpg');
        Storage::disk('local')->assertMissing('plans/files/delete-plan.pdf');
    }

    public function test_guest_cannot_create_plan(): void
    {
        $category = Category::factory()->create();

        $payload = [
            'category_id' => $category->id,
            'title' => 'Plan interdit',
            'slug' => 'plan-interdit',
            'price_cents' => 15000,
            'currency' => 'XAF',
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/plans', $payload);

        $response->assertUnauthorized();
    }

    public function test_seller_cannot_update_another_seller_plan(): void
    {
        $category = Category::factory()->create();
        $owner = User::factory()->seller()->create();
        $otherSeller = User::factory()->seller()->create();
        $plan = Plan::factory()->create([
            'seller_id' => $owner->id,
            'category_id' => $category->id,
        ]);

        $this->actingAs($otherSeller, 'api');

        $response = $this->putJson('/api/plans/'.$plan->id, [
            'title' => 'Modification non autorisee',
        ]);

        $response->assertForbidden();
    }
}
