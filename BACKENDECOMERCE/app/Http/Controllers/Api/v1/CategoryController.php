<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        // نختار نسخة HEAD لأنها تتضمن حساب عدد المنتجات المرتبطة
        $categories = Category::withCount('products')->get();
        
        return $this->successResponse($categories, 'Categories retrieved successfully');
    }
}