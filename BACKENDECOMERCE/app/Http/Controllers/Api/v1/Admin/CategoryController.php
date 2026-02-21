<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $query = Category::query();

        if ($request->filled('search')) {
           $search = $request->input('search');
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        $categories = $query->orderBy('name')->paginate($request->integer('per_page', 15));

        return $this->successResponse($categories, 'Categories retrieved successfully');
    }

   public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            // CORRECTION: 'image' au lieu de 'image_path'
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create($data);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    public function update(CategoryRequest $request, int $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            // CORRECTION: 'image' au lieu de 'image_path'
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        return $this->successResponse($category, 'Category updated successfully');
    }

    public function destroy(int $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        // CORRECTION: 'image' au lieu de 'image_path'
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
