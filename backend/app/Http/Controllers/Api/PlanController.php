<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Http\Resources\PlanResource;
use App\Services\AuditLogService;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PlanController extends Controller
{
    public function __construct(
        private readonly FileUploadService $fileUploadService,
        private readonly AuditLogService $auditLogService
    )
    {
    }

    public function index(): JsonResponse
    {
        $perPage = max(1, request()->integer('per_page', 15));
        $page = max(1, request()->integer('page', 1));
        $searchTerm = request('q', '');
        $categoryId = request()->integer('category_id');
        $minPrice = $this->toCents(request('price_min'));
        $maxPrice = $this->toCents(request('price_max'));
        $sortMode = request('sort', 'recent');

        $plansQuery = Plan::query()
            ->with(['seller:id,name,email', 'category:id,name,slug']);

        if ($categoryId > 0) {
            $plansQuery->where('category_id', $categoryId);
        }

        $plansQuery->searchTerm($searchTerm)
            ->priceBetween($minPrice, $maxPrice);

        if (! request()->user('api')) {
            $plansQuery->approved();
        } else {
            $status = request('status');
            if (in_array($status, ['draft', 'pending', 'approved', 'rejected'], true)) {
                $plansQuery->where('status', $status);
            }
        }

        match ($sortMode) {
            'price-asc' => $plansQuery->orderBy('price_cents', 'asc'),
            'price-desc' => $plansQuery->orderBy('price_cents', 'desc'),
            'popular' => $plansQuery->orderBy('updated_at', 'desc'),
            default => $plansQuery->latest('created_at'),
        };

        $plans = $plansQuery->paginate($perPage, ['*'], 'page', $page);

        return PlanResource::collection($plans)->response();
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json(
            $plan->load(['seller:id,name,email', 'category:id,name,slug'])
        );
    }

    public function coverImage(Plan $plan): BinaryFileResponse
    {
        if (! request()->user('api') && $plan->status !== 'approved') {
            abort(404);
        }

        if (! $plan->cover_image_path || ! Storage::disk('local')->exists($plan->cover_image_path)) {
            abort(404);
        }

        // the `disk` helper returns a Filesystem contract which doesn't declare
        // mimeType; the actual implementation is a FilesystemAdapter.
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('local');

        $mimeType = $disk->mimeType($plan->cover_image_path) ?: 'application/octet-stream';
        $absolutePath = $disk->path($plan->cover_image_path);

        return response()->file($absolutePath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Plan::class);

        $user = $request->user();

        $rules = [
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:200', 'unique:plans,slug'],
            'description' => ['nullable', 'string'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'status' => ['required', Rule::in(['draft', 'pending', 'approved', 'rejected'])],
            'cover_image' => ['nullable', 'file', 'image', 'max:5120'],
            'plan_file' => ['nullable', 'file', 'mimes:pdf,dwg,dxf,zip', 'max:30720'],
        ];

        if ($user->role === 'admin') {
            $rules['seller_id'] = ['required', Rule::exists('users', 'id')->where('role', 'seller')];
        } else {
            $rules['seller_id'] = ['prohibited'];
        }

        $validated = $request->validate($rules);

        if ($user->role === 'seller') {
            $validated['seller_id'] = $user->id;
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $this->fileUploadService->upload(
                $request->file('cover_image'),
                'plans/covers'
            );
        }

        if ($request->hasFile('plan_file')) {
            $validated['file_path'] = $this->fileUploadService->upload(
                $request->file('plan_file'),
                'plans/files'
            );
        }

        unset($validated['cover_image'], $validated['plan_file']);

        $plan = Plan::query()->create($validated);
        $this->auditLogService->log(
            action: 'plan.created',
            userId: $request->user()->id,
            auditableType: Plan::class,
            auditableId: $plan->id,
            metadata: ['status' => $plan->status],
            request: $request
        );

        return response()->json(
            $plan->load(['seller:id,name,email', 'category:id,name,slug']),
            201
        );
    }

    public function update(Request $request, Plan $plan): JsonResponse
    {
        $this->authorize('update', $plan);

        $user = $request->user();

        $rules = [
            'category_id' => ['sometimes', 'exists:categories,id'],
            'title' => ['sometimes', 'string', 'max:180'],
            'slug' => ['sometimes', 'string', 'max:200', Rule::unique('plans', 'slug')->ignore($plan->id)],
            'description' => ['nullable', 'string'],
            'price_cents' => ['sometimes', 'integer', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'status' => ['sometimes', Rule::in(['draft', 'pending', 'approved', 'rejected'])],
            'cover_image' => ['nullable', 'file', 'image', 'max:5120'],
            'plan_file' => ['nullable', 'file', 'mimes:pdf,dwg,dxf,zip', 'max:30720'],
        ];

        if ($user->role === 'admin') {
            $rules['seller_id'] = ['sometimes', Rule::exists('users', 'id')->where('role', 'seller')];
        } else {
            $rules['seller_id'] = ['prohibited'];
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $this->fileUploadService->replace(
                $request->file('cover_image'),
                $plan->cover_image_path,
                'plans/covers'
            );
        }

        if ($request->hasFile('plan_file')) {
            $validated['file_path'] = $this->fileUploadService->replace(
                $request->file('plan_file'),
                $plan->file_path,
                'plans/files'
            );
        }

        unset($validated['cover_image'], $validated['plan_file']);

        $plan->update($validated);
        $this->auditLogService->log(
            action: 'plan.updated',
            userId: $request->user()->id,
            auditableType: Plan::class,
            auditableId: $plan->id,
            metadata: array_keys($validated),
            request: $request
        );

        return response()->json(
            $plan->fresh()->load(['seller:id,name,email', 'category:id,name,slug'])
        );
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $this->authorize('delete', $plan);
        $request = request();

        $this->fileUploadService->delete($plan->cover_image_path);
        $this->fileUploadService->delete($plan->file_path);
        $this->auditLogService->log(
            action: 'plan.deleted',
            userId: $request->user()?->id,
            auditableType: Plan::class,
            auditableId: $plan->id,
            request: $request
        );
        $plan->delete();

        return response()->json(status: 204);
    }

    private function toCents(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = (string) $value;
        $normalized = str_replace(',', '.', $normalized);

        if (! is_numeric($normalized)) {
            return null;
        }

        return (int) round((float) $normalized * 100);
    }
}
