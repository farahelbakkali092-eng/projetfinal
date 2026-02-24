<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandRequest;
use App\Models\Brand;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        $brands = $query->orderBy('name')->paginate($request->integer('per_page', 15));

        return $this->successResponse($brands, 'Brands retrieved successfully');
    }

    public function store(BrandRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        $brand = Brand::create($data);

        return $this->successResponse($brand, 'Brand created successfully', 201);
    }

    public function show(int $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return $this->errorResponse('Brand not found', 404);
        }

        return $this->successResponse($brand);
    }

    public function update(BrandRequest $request, int $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return $this->errorResponse('Brand not found', 404);
        }

        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        $brand->update($data);

        return $this->successResponse($brand, 'Brand updated successfully');
    }

    public function destroy(int $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return $this->errorResponse('Brand not found', 404);
        }

        $brand->delete();

        return $this->successResponse(null, 'Brand deleted successfully');
    }
}
