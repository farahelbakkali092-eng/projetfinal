<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Models\Section;
use App\Http\Requests\Admin\SectionRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class SectionController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $sections = Section::orderBy('order')->get();
        return $this->successResponse($sections, 'Sections retrieved successfully');
    }

    public function store(SectionRequest $request)
    {
        $data = $request->validated();
        if (!isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $section = Section::create($data);
        return $this->successResponse($section, 'Section created successfully', 201);
    }

    public function show($id)
    {
        $section = Section::with('categories')->find($id);
        if (!$section) return $this->errorResponse('Section not found', 404);
        return $this->successResponse($section);
    }

    public function update(SectionRequest $request, $id)
    {
        $section = Section::find($id);
        if (!$section) return $this->errorResponse('Section not found', 404);
        
        $data = $request->validated();
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $section->update($data);
        return $this->successResponse($section, 'Section updated successfully');
    }

    public function destroy($id)
    {
        $section = Section::find($id);
        if (!$section) return $this->errorResponse('Section not found', 404);
        $section->delete();
        return $this->successResponse(null, 'Section deleted successfully');
    }
}
