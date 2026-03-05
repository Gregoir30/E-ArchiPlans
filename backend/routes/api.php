<?php

use App\Http\Controllers\Api\AdminManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\LandingController;
use App\Http\Controllers\Api\ModelViewController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PlanController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactMessageController::class, 'store']);
Route::get('/public/categories', [CatalogController::class, 'categories']);
Route::get('/landing', [LandingController::class, 'index']);
Route::get('/plans/{plan}/cover-image', [PlanController::class, 'coverImage'])->whereNumber('plan');
Route::apiResource('plans', PlanController::class)->only(['index', 'show']);

Route::middleware(['auth:api', 'active'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/my-orders', [OrderController::class, 'index']);
    Route::get('/cart', [OrderController::class, 'cart']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{order}/simulate-fedapay', [OrderController::class, 'simulateFedapay']);
    Route::post('/orders/{order}/simulate-payment-success', [OrderController::class, 'simulatePaymentSuccess']);
    Route::post('/orders/{order}/simulate-payment-failure', [OrderController::class, 'simulatePaymentFailure']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::get('/downloads/{token}', [DownloadController::class, 'download'])->name('downloads.secure');
});

Route::middleware(['auth:api', 'active', 'role:admin'])->group(function (): void {
    Route::get('/users', [ModelViewController::class, 'users']);
    Route::get('/categories', [ModelViewController::class, 'categories']);
    Route::get('/orders', [ModelViewController::class, 'orders']);
    Route::get('/order-items', [ModelViewController::class, 'orderItems']);
    Route::get('/plan-downloads', [ModelViewController::class, 'planDownloads']);
    Route::get('/contact-messages', [ModelViewController::class, 'contactMessages']);
    Route::get('/audit-logs', [ModelViewController::class, 'auditLogs']);
    Route::get('/admin/users', [AdminManagementController::class, 'users']);
    Route::patch('/admin/users/{user}', [AdminManagementController::class, 'updateUser']);
    Route::patch('/admin/plans/{plan}/moderate', [AdminManagementController::class, 'moderatePlan']);
    Route::get('/admin/categories', [AdminManagementController::class, 'categories']);
    Route::post('/admin/categories', [AdminManagementController::class, 'storeCategory']);
    Route::match(['put', 'patch'], '/admin/categories/{category}', [AdminManagementController::class, 'updateCategory']);
    Route::delete('/admin/categories/{category}', [AdminManagementController::class, 'destroyCategory']);
});

Route::middleware(['auth:api', 'active', 'role:seller'])->group(function (): void {
    Route::get('/dashboard/seller', [DashboardController::class, 'seller']);
});

Route::middleware(['auth:api', 'active', 'role:admin'])->group(function (): void {
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);
});

Route::middleware(['auth:api', 'active', 'role:seller,admin'])->group(function (): void {
    Route::apiResource('plans', PlanController::class)->only(['store', 'update', 'destroy']);
});
