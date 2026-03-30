<?php

namespace App\Http\Requests\Products;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProductRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $id = $this->route('id') ?? $this->id;

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,&\+\(\)À-ÿ]+$/u' // Pas de chiffres seuls
            ],
            'slug' => ['required', 'string', Rule::unique('products', 'slug')->ignore($id)],
            'description' => [
                'required',
                'string',
                'min:10',
                'max:300',
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,!?;:&\+\(\)À-ÿ]+$/u' // Pas de chiffres seuls
            ],
            'price' => ['required', 'numeric', 'min:10', 'max:10000'],
            'price_sold' => ['nullable', 'numeric', 'min:5', 'lt:price'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'stock' => ['required', 'integer', 'min:0', 'max:50000'],
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['required', 'exists:brands,id'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'capacity' => ['nullable', 'string', Rule::in(['30 ml', '50 ml', '75 ml', '90 ml', '100 ml'])],
            'reference' => ['nullable', 'string', 'max:50'],
            'images' => ['nullable', 'array', 'max:3'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Prepare for validation
     */
    protected function prepareForValidation()
    {
        if ($this->name) {
            $this->merge([
                'slug' => Str::slug($this->name),
                'description' => strip_tags($this->description), // Simple sanitization
            ]);
        }
    }
}
