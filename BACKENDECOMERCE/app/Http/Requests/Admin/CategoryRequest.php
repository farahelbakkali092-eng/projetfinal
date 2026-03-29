<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $categoryId = $this->route('id') ?? $this->id;

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:50',
                // Permissive regex: Letters, Numbers, Spaces, and common punctuation
                // Ensures not only digits
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,!?;:&\+\(\)À-ÿ\/@#\$%\*\=_]+$/u',
                // Unicité du nom uniquement au sein de la même section
                Rule::unique('categories', 'name')
                    ->where(fn ($query) => $query->where('section_id', $this->section_id))
                    ->ignore($categoryId),
            ],
            'description' => [
                'required',
                'string',
                'min:10',
                'max:500', // Increased max length slightly
                // More permissive for description
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,!?;:&\+\(\)À-ÿ\/\\@#\$%\*\=\+\"\[\]\{\}\|_\r\n]+$/u'
            ],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'section_id' => ['nullable', 'exists:sections,id'],
        ];
    }
}
