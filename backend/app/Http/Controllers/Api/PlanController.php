<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlanController extends Controller
{
    public function __construct(private readonly FileUploadService $fileUploadService)
    {
    }

    public function index(): JsonResponse
    {
        $plansQuery = Plan::query()
            ->with(['seller:id,name,email', 'category:id,name,slug'])
            ->latest();

        $categoryId = request()->integer('category_id');
        if ($categoryId > 0) {
            $plansQuery->where('category_id', $categoryId);
        }

        if (! request()->user('api')) {
            $plansQuery->where('status', 'approved');
        }

        $plans = $plansQuery->paginate(15);

        return response()->json($plans);
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json(
            $plan->load(['seller:id,name,email', 'category:id,name,slug'])
        );
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

        return response()->json(
            $plan->fresh()->load(['seller:id,name,email', 'category:id,name,slug'])
        );
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $this->authorize('delete', $plan);

        $this->fileUploadService->delete($plan->cover_image_path);
        $this->fileUploadService->delete($plan->file_path);
        $plan->delete();

        return response()->json(status: 204);
    }
}
