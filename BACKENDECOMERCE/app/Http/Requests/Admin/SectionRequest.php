<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class SectionRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('sections', 'slug')->ignore($id)],
            'order' => 'required|integer|min:0',
            'is_active' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'order.required' => 'Ordre d’affichage invalide. Il doit être un nombre positif, supérieur ou égal à 0.',
            'order.integer' => 'Ordre d’affichage invalide. Il doit être un nombre positif, supérieur ou égal à 0.',
            'order.min' => 'Ordre d’affichage invalide. Il doit être un nombre positif, supérieur ou égal à 0.',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->name) {
            $this->merge([
                'slug' => $this->slug ?: Str::slug($this->name),
            ]);
        }
    }
}
