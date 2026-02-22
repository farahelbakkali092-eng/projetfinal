<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $categoryId = $this->route('id') ?? $this->id;
        \Illuminate\Support\Facades\Log::info('CategoryRequest checking ID:', [
            'route_id' => $this->route('id'),
            'body_id' => $this->id,
            'determined' => $categoryId
        ]);

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId),
            ],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'section_id' => ['nullable', 'exists:sections,id'],
        ];
    }
}
