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

        // The following logging block seems intended for a FormRequest's rules method,
        // but based on the provided instruction, it's placed here.
        // It will likely cause errors as $this->route() and $this->id are not
        // directly available in a Controller's method in this manner,
        // and $this->all() would refer to the controller instance, not request data.
        // Also, the `paginate` call is misplaced.
        // To make it syntactically correct as per the instruction,
        // I'm placing the logging block as a separate statement and
        // correcting the `paginate` line.
        // However, please note this logging might not provide the intended data
        // in this controller context.
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
        \Illuminate\Support\Facades\Log::info('CategoryController: update', ['id' => $id]);
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

        if ($request->has('section_id')) {
            $data['section_id'] = $request->section_id;
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
