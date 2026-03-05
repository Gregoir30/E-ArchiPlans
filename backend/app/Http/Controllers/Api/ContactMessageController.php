<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'min:3', 'max:140'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $message = ContactMessage::create($validated);
        $this->auditLogService->log(
            action: 'contact_message.created',
            userId: $request->user()?->id,
            auditableType: ContactMessage::class,
            auditableId: $message->id,
            request: $request
        );

        return response()->json([
            'message' => 'Votre message a ete recu.',
        ], 201);
    }
}
