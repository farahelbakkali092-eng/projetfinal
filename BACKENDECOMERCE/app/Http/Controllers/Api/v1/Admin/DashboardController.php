<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Traits\ApiResponseTrait;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function stats()
    {
        return $this->successResponse([
            'products'   => Product::count(),
            'orders'     => Order::count(),
            'users'      => User::count(),
            'brands'     => Brand::count(),
            'categories' => Category::count(),
        ], 'Dashboard stats retrieved successfully');
    }

    /**
     * Generate a signed Metabase embed URL (JWT HS256) without firebase/php-jwt.
     */
    public function metabaseDashboardUrl()
    {
        $siteUrl     = rtrim(env('METABASE_SITE_URL', ''), '/');
        $secretKey   = env('METABASE_SECRET_KEY', '');
        $dashboardId = (int) env('METABASE_DASHBOARD_ID', 0);

        if (!$siteUrl || !$secretKey || $dashboardId <= 0) {
            return $this->errorResponse('Metabase configuration is missing.', 500);
        }

        $token     = $this->buildMetabaseJwt($secretKey, $dashboardId);
        $iframeUrl = "{$siteUrl}/embed/dashboard/{$token}#bordered=false&titled=false";

        return $this->successResponse([
            'iframe_url' => $iframeUrl,
        ], 'Metabase embed URL generated successfully');
    }

    /**
     * Build a Metabase-compatible HS256 JWT without any external dependency.
     */
    private function buildMetabaseJwt(string $secretKey, int $dashboardId): string
    {
        // Header
        $header = $this->base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT',
        ]));

        // Payload
        $payload = $this->base64UrlEncode(json_encode([
            'resource' => ['dashboard' => $dashboardId],
            'params'   => new \stdClass(),
            'exp'      => time() + 600,
        ]));

        // Signature
        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", $secretKey, true)
        );

        return "{$header}.{$payload}.{$signature}";
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
