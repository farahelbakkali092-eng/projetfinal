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
            'products' => Product::count(),
            'orders' => Order::count(),
            'users' => User::count(),
            'brands' => Brand::count(),
            'categories' => Category::count(),
        ], 'Dashboard stats retrieved successfully');
    }
}
