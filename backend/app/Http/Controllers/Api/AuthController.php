<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', Rule::in(['buyer', 'seller', 'admin'])],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'buyer',
        ]);
        ['plain' => $token, 'hashed' => $hashedToken] = $this->issueApiToken();
        $user->forceFill(['api_token' => $hashedToken])->save();
        $this->auditLogService->log(
            action: 'auth.register',
            userId: $user->id,
            auditableType: User::class,
            auditableId: $user->id,
            metadata: ['role' => $user->role],
            request: $request
        );

        return response()->json([
            'message' => 'Compte cree avec succes.',
            'token' => $token,
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Ce compte est desactive. Contactez un administrateur.',
            ], 403);
        }

        ['plain' => $token, 'hashed' => $hashedToken] = $this->issueApiToken();
        $user->forceFill(['api_token' => $hashedToken])->save();
        $this->auditLogService->log(
            action: 'auth.login',
            userId: $user->id,
            auditableType: User::class,
            auditableId: $user->id,
            metadata: ['role' => $user->role],
            request: $request
        );

        return response()->json([
            'message' => 'Connexion reussie.',
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->forceFill(['api_token' => null])->save();
            $this->auditLogService->log(
                action: 'auth.logout',
                userId: $user->id,
                auditableType: User::class,
                auditableId: $user->id,
                request: $request
            );
        }

        return response()->json([
            'message' => 'Deconnexion reussie.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $updates = [];

        if (array_key_exists('name', $validated)) {
            $updates['name'] = $validated['name'];
        }

        if (array_key_exists('email', $validated)) {
            $updates['email'] = $validated['email'];
        }

        if (! empty($validated['password'])) {
            $updates['password'] = $validated['password'];
        }

        if (! empty($updates)) {
            $user->update($updates);
            $this->auditLogService->log(
                action: 'auth.profile.updated',
                userId: $user->id,
                auditableType: User::class,
                auditableId: $user->id,
                metadata: array_keys($updates),
                request: $request
            );
        }

        return response()->json([
            'message' => 'Profil mis a jour avec succes.',
            'user' => $this->userPayload($user->fresh()),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => (bool) $user->is_active,
        ];
    }

    private function issueApiToken(): array
    {
        $plain = Str::random(60);

        return [
            'plain' => $plain,
            'hashed' => hash('sha256', $plain),
        ];
    }
}
