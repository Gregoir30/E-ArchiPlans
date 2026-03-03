<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LandingController extends Controller
{
    public function index(): JsonResponse
    {
        $heroPlan = Plan::query()
            ->approved()
            ->with(['seller:id,name,email', 'category:id,name,slug'])
            ->latest('created_at')
            ->first();

        $featuredPlans = Plan::query()
            ->approved()
            ->with(['seller:id,name,email', 'category:id,name,slug'])
            ->latest('created_at')
            ->take(3)
            ->get();

        $galleryPlans = Plan::query()
            ->approved()
            ->with(['seller:id,name,email', 'category:id,name,slug'])
            ->latest('updated_at')
            ->take(12)
            ->get();

        $priceMin = Plan::query()->approved()->min('price_cents') ?: 0;
        $priceMax = Plan::query()->approved()->max('price_cents') ?: 0;

        $totalPlans = Plan::query()->approved()->count();
        $totalCategories = Category::count();
        $totalSellers = User::query()->where('role', 'seller')->count();

        $categoryFilters = Category::query()
            ->select(['id', 'name', 'slug'])
            ->withCount(['plans as plans_count' => function ($query) {
                $query->approved();
            }])
            ->having('plans_count', '>', 0)
            ->orderByDesc('plans_count')
            ->get();

        return response()->json([
            'hero_plan' => $heroPlan ? new PlanResource($heroPlan) : null,
            'featured_plans' => PlanResource::collection($featuredPlans),
            'gallery_plans' => PlanResource::collection($galleryPlans),
            'stats' => [
                'total_plans' => $totalPlans,
                'total_categories' => $totalCategories,
                'total_sellers' => $totalSellers,
            ],
            'price_range' => [
                'min' => $priceMin,
                'max' => $priceMax,
            ],
            'category_filters' => $categoryFilters,
        ]);
    }
}
