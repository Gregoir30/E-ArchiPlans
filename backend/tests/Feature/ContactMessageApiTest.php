<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactMessageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_contact_message(): void
    {
        $payload = [
            'name' => 'Ama Kossi',
            'email' => 'ama@example.com',
            'subject' => 'Question sur un plan',
            'message' => 'Je veux des details sur la surface et les niveaux.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Votre message a ete recu.',
            ]);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'ama@example.com',
            'subject' => 'Question sur un plan',
        ]);
    }

    public function test_it_validates_contact_message_payload(): void
    {
        $response = $this->postJson('/api/contact', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);

        $this->assertDatabaseCount('contact_messages', 0);
    }
}

