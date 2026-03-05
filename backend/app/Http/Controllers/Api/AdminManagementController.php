<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminManagementController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->filled('role'), fn ($query) => $query->where('role', (string) $request->string('role')))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim((string) $request->string('search'));
                $query->where(function ($inner) use ($search): void {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20, ['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        return response()->json($users);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['sometimes', Rule::in(['buyer', 'seller', 'admin'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($request->user()->id === $user->id && array_key_exists('is_active', $validated) && ! $validated['is_active']) {
            return response()->json([
                'message' => 'Vous ne pouvez pas desactiver votre propre compte.',
            ], 422);
        }

        $user->update($validated);

        if (array_key_exists('is_active', $validated) && ! $validated['is_active']) {
            $user->forceFill(['api_token' => null])->save();
        }
        $this->auditLogService->log(
            action: 'admin.user.updated',
            userId: $request->user()->id,
            auditableType: User::class,
            auditableId: $user->id,
            metadata: $validated,
            request: $request
        );

        return response()->json([
            'message' => 'Utilisateur mis a jour.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
            ],
        ]);
    }

    public function moderatePlan(Request $request, Plan $plan): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        $plan->update([
            'status' => $validated['status'],
        ]);
        $this->auditLogService->log(
            action: 'admin.plan.moderated',
            userId: $request->user()->id,
            auditableType: Plan::class,
            auditableId: $plan->id,
            metadata: ['status' => $validated['status']],
            request: $request
        );

        return response()->json([
            'message' => $validated['status'] === 'approved'
                ? 'Plan approuve.'
                : 'Plan rejete.',
            'plan' => $plan->fresh()->load(['seller:id,name,email', 'category:id,name,slug']),
        ]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(
            Category::query()
                ->orderBy('name')
                ->paginate(20)
        );
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:categories,name'],
            'slug' => ['nullable', 'string', 'max:140', 'unique:categories,slug'],
        ]);

        $category = Category::query()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
        ]);
        $this->auditLogService->log(
            action: 'admin.category.created',
            userId: $request->user()->id,
            auditableType: Category::class,
            auditableId: $category->id,
            request: $request
        );

        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120', Rule::unique('categories', 'name')->ignore($category->id)],
            'slug' => ['sometimes', 'required', 'string', 'max:140', Rule::unique('categories', 'slug')->ignore($category->id)],
        ]);

        $category->update($validated);
        $this->auditLogService->log(
            action: 'admin.category.updated',
            userId: $request->user()->id,
            auditableType: Category::class,
            auditableId: $category->id,
            metadata: array_keys($validated),
            request: $request
        );

        return response()->json($category->fresh());
    }

    public function destroyCategory(Request $request, Category $category): JsonResponse
    {
        if ($category->plans()->exists()) {
            return response()->json([
                'message' => 'Categorie liee a des plans. Suppression impossible.',
            ], 422);
        }

        $category->delete();
        $this->auditLogService->log(
            action: 'admin.category.deleted',
            userId: $request->user()->id,
            auditableType: Category::class,
            auditableId: $category->id,
            request: $request
        );

        return response()->json(status: 204);
    }
}
