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
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,&\+\(\)À-ÿ]+$/u',
                Rule::unique('categories', 'name')->ignore($categoryId),
            ],
            'description' => [
                'required',
                'string',
                'min:10',
                'max:300',
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,!?;:&\+\(\)À-ÿ]+$/u'
            ],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'section_id' => ['nullable', 'exists:sections,id'],
        ];
    }
}
