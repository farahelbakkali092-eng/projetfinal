<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\ProductController;
use App\Http\Controllers\Api\v1\CategoryController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\PaymentController;
use App\Http\Controllers\Api\v1\ContactMessageController;
use App\Http\Controllers\Api\v1\DiagnosticController;
use App\Http\Controllers\Api\v1\BrandController;
use App\Http\Controllers\Api\v1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\v1\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\v1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\v1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\v1\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Api\v1\Admin\SectionController as AdminSectionController;
use App\Http\Controllers\Api\v1\PasswordResetController;
use App\Http\Controllers\Api\v1\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    
    // --- 🟢 ROUTES PUBLIQUES (Accessibles à tous) ---
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    
    // ✅ Routes de réinitialisation de mot de passe (DÉPLACÉES ICI)
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
    
    // Produits & Catégories
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/best-sellers', [ProductController::class, 'bestSellers']);
    Route::get('/products/on-sale', [ProductController::class, 'onSale']);
    Route::get('/products/categories', [CategoryController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/settings', [\App\Http\Controllers\Api\v1\SettingController::class, 'index']);
    
    // Routes pour les marques (BrandController)
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{slug}/products', [BrandController::class, 'products']);

    // Sections publiques
    Route::get('/sections', [\App\Http\Controllers\Api\v1\Admin\SectionController::class, 'index']);

    // Contact messages (public)
    Route::post('/contact/messages', [ContactMessageController::class, 'store']);

    // Chatbot — Recommandation produits par IA
    Route::post('/chat/recommend', [ChatController::class, 'recommend']);

    // Diagnostic (Public - DiagnosticController)
    Route::post('/diagnostic', [DiagnosticController::class, 'store']);

    // Webhook Stripe/Paiements
    Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook']);


    // --- 🔴 ROUTES PRIVÉES (Connexion obligatoire via Sanctum) ---
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::patch('/me/password', [AuthController::class, 'updatePassword']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);

        // Payments
        Route::post('/orders/{id}/pay', [PaymentController::class, 'initiatePayment']);

        // --- 🛡️ ROUTES ADMIN (Connexion + Rôle Admin obligatoire) ---
        Route::middleware('admin')->group(function () {
            Route::post('/products', [ProductController::class, 'store']);
            Route::post('/products/import', [ProductController::class, 'bulkImport']);
            Route::put('/products/{id}', [ProductController::class, 'update']);
            Route::delete('/products/{id}', [ProductController::class, 'destroy']);
            Route::delete('/products/images/{imageId}', [ProductController::class, 'destroyImage']);
            
            Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

            // Dashboard stats
            Route::get('/admin/dashboard/stats', [AdminDashboardController::class, 'stats']);

            // Brands
            Route::get('/admin/brands', [AdminBrandController::class, 'index']);
            Route::post('/admin/brands', [AdminBrandController::class, 'store']);
            Route::get('/admin/brands/{id}', [AdminBrandController::class, 'show']);
            Route::put('/admin/brands/{id}', [AdminBrandController::class, 'update']);
            Route::delete('/admin/brands/{id}', [AdminBrandController::class, 'destroy']);

            // Categories
            Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
            Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
            Route::get('/admin/categories/{id}', [AdminCategoryController::class, 'show']);
            Route::put('/admin/categories/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/admin/categories/{id}', [AdminCategoryController::class, 'destroy']);

            // Sections
            Route::get('/admin/sections', [AdminSectionController::class, 'index']);
            Route::post('/admin/sections', [AdminSectionController::class, 'store']);
            Route::get('/admin/sections/{id}', [AdminSectionController::class, 'show']);
            Route::put('/admin/sections/{id}', [AdminSectionController::class, 'update']);
            Route::delete('/admin/sections/{id}', [AdminSectionController::class, 'destroy']);

            // Users
            Route::get('/admin/users', [AdminUserController::class, 'index']);
            Route::get('/admin/users/roles', [AdminUserController::class, 'roles']);
            Route::patch('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);
            Route::patch('/admin/users/{id}/status', [AdminUserController::class, 'updateStatus']);

            // Messages clients
            Route::get('/admin/messages', [AdminContactMessageController::class, 'index']);
            Route::get('/admin/messages/{id}', [AdminContactMessageController::class, 'show']);
            Route::patch('/admin/messages/{id}/read', [AdminContactMessageController::class, 'markRead']);

            // Settings
            Route::patch('/admin/settings', [\App\Http\Controllers\Api\v1\SettingController::class, 'update']);
            
        });
    });
});