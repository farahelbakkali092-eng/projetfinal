<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Firebase\JWT\JWT;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function stats()
    {
        return $this->successResponse([
            'products' => Product::count(),
            'orders' => Order::count(),
            'users' => User::count(),
            'brands' => Brand::count(),
            'categories' => Category::count(),
        ], 'Dashboard stats retrieved successfully');
    }

    public function metabaseDashboardUrl()
    {
        $siteUrl = rtrim(env('METABASE_SITE_URL', ''), '/');
        $secretKey = env('METABASE_SECRET_KEY', '');
        $dashboardId = (int)env('METABASE_DASHBOARD_ID', 0);

        if (!$siteUrl || !$secretKey || $dashboardId <= 0) {
            return $this->errorResponse('Metabase configuration is missing.', 500);
        }

        $payload = [
            'resource' => ['dashboard' => $dashboardId],
            'params' => (object)[],
            'exp' => time() + 600,
        ];

        $token = JWT::encode($payload, $secretKey, 'HS256');
        $iframeUrl = "{$siteUrl}/embed/dashboard/{$token}#bordered=false&titled=false";

        return $this->successResponse([
            'iframe_url' => $iframeUrl,
            'token' => $token,
            'site_url' => $siteUrl,
        ], 'Metabase embed data generated successfully');
    }
}
