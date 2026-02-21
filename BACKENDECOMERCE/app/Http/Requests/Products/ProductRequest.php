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
        $productId = $this->route('id');

        // Dans la méthode rules() de ProductRequest :
    return [
        'name' => ['required', 'string', 'max:50', 'regex:/^[\pL\pN\s\-\']+$/u'], // <-- \pL pour les accents, \pN pour les chiffres
        'slug' => ['required', 'string', Rule::unique('products', 'slug')->ignore($productId)],
        'description' => ['required', 'string'], // <-- Retrait de max:255
        'price' => ['required', 'numeric', 'min:0.01'],
        'stock' => ['required', 'integer', 'min:0'],
        'category_id' => ['required', 'exists:categories,id'],
        'brand_id' => ['required', 'exists:brands,id'],
        'section_id' => ['nullable', 'exists:sections,id'], // <-- CORRIGÉ
        'images' => ['nullable', 'array'],
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
