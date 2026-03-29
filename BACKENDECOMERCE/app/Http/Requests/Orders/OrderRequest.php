<?php

namespace App\Http\Requests\Orders;

use App\Http\Requests\BaseApiRequest;

class OrderRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'fullName'         => ['required', 'string', 'min:2', 'max:20', "regex:/^[\pL\s\-']+$/u"],
            'phone'            => ['required', 'string', 'regex:/^\+212\s?(0?[67]\d{8})$/'],
            'postalCode'       => ['required', 'string', 'regex:/^\d{5,6}$/'],
            'city'             => ['required', 'string', 'min:2', 'max:15', "regex:/^[\pL\s\-']+$/u"],
            'address'          => ['required', 'string', 'min:2', 'max:30', "regex:/^(?![0-9]+$)[\pL\s0-9\-\',.#]+$/u"],
            'payment_method'   => ['required', 'string', 'in:stripe,cod'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required'   => 'Le nom complet est obligatoire.',
            'fullName.regex'      => 'Le nom complet ne doit contenir que des lettres.',
            'fullName.min'        => 'Le nom doit contenir au moins 2 caractères.',
            'fullName.max'        => 'Le nom ne peut pas dépasser 20 caractères.',
            'phone.required'      => 'Le numéro de téléphone est obligatoire.',
            'phone.regex'         => 'Format de téléphone invalide (+212 obligatoire).',
            'postalCode.required' => 'Le code postal est obligatoire.',
            'postalCode.regex'    => 'Le code postal doit contenir 5 ou 6 chiffres uniquement.',
            'city.required'       => 'La ville est obligatoire.',
            'city.regex'          => 'La ville ne doit contenir que des lettres.',
            'city.min'            => 'La ville doit contenir au moins 2 caractères.',
            'city.max'            => 'La ville ne peut pas dépasser 15 caractères.',
            'address.required'    => 'L\'adresse est obligatoire.',
            'address.regex'       => 'L\'adresse ne peut pas être composée uniquement de chiffres.',
            'address.min'         => 'L\'adresse doit contenir au moins 2 caractères.',
            'address.max'         => 'L\'adresse ne peut pas dépasser 30 caractères.',
        ];
    }
}