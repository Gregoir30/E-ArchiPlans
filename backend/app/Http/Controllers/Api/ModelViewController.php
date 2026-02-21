<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PlanDownload;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ModelViewController extends Controller
{
    public function users(): JsonResponse
    {
        return response()->json(
            User::query()->select(['id', 'name', 'email', 'role', 'created_at'])->latest()->paginate(20)
        );
    }

    public function categories(): JsonResponse
    {
        return response()->json(
            Category::query()->latest()->paginate(20)
        );
    }

    public function orders(): JsonResponse
    {
        return response()->json(
            Order::query()->with('buyer:id,name,email')->latest()->paginate(20)
        );
    }

    public function orderItems(): JsonResponse
    {
        return response()->json(
            OrderItem::query()->with(['order:id,buyer_id,total_cents,payment_status', 'plan:id,title'])->latest()->paginate(20)
        );
    }

    public function planDownloads(): JsonResponse
    {
        return response()->json(
            PlanDownload::query()->with('orderItem:id,order_id,plan_id')->latest()->paginate(20)
        );
    }

    public function contactMessages(): JsonResponse
    {
        return response()->json(
            ContactMessage::query()->latest()->paginate(20)
        );
    }
}

