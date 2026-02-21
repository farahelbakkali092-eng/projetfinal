<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get all brands with full image URLs
     */
    public function index()
    {
        $brands = Brand::orderBy('name')->get()->map(function ($brand) {
            return $this->formatBrand($brand);
        });

        return $this->successResponse($brands, 'Brands retrieved successfully');
    }

    /**
     * Get brand details and its products by slug
     */
    public function products($slug)
    {
        $brand = Brand::where('slug', $slug)->first();

        if (!$brand) {
            return $this->errorResponse('Marque non trouvée', 404);
        }

        // Charger les produits avec leurs images
        $products = $brand->products()->with('images')->get();

        return $this->successResponse([
            'brand' => $this->formatBrand($brand),
            'products' => $products
        ], 'Brand products retrieved successfully');
    }

    /**
     * Helper to format brand data
     */
    private function formatBrand($brand)
    {
        return [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'description' => $brand->description,
            'image_url' => $brand->image ? asset('storage/' . $brand->image) : null,
            'created_at' => $brand->created_at,
            'updated_at' => $brand->updated_at,
        ];
    }
}
