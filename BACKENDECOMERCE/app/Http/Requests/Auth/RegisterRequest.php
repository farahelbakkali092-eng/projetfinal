<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:20', 'regex:/^[\pL\-\']+$/u'],
            'last_name'  => ['required', 'string', 'min:2', 'max:20', 'regex:/^[\pL\-\']+$/u'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users', 'lowercase'],
            // Formats acceptés : +212 06XXXXXXXX | +212 07XXXXXXXX | +212 6XXXXXXXX | +212 7XXXXXXXX
            'phone'      => ['required', 'string', 'regex:/^\+212\s?(0?[67]\d{8})$/'],
            'password'   => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'role_id' => ['nullable', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.min'      => 'Le prénom doit contenir au moins 2 caractères.',
            'first_name.max'      => 'Le prénom ne peut pas dépasser 20 caractères.',
            'first_name.regex'    => 'Le prénom ne doit contenir que des lettres.',
            'last_name.required'  => 'Le nom est obligatoire.',
            'last_name.min'       => 'Le nom doit contenir au moins 2 caractères.',
            'last_name.max'       => 'Le nom ne peut pas dépasser 20 caractères.',
            'last_name.regex'     => 'Le nom ne doit contenir que des lettres.',
            'email.required'      => 'L\'adresse email est obligatoire.',
            'email.email'         => 'Veuillez entrer une adresse email valide.',
            'email.unique'        => 'Cette adresse email est déjà utilisée.',
            'phone.required'      => 'Le numéro de téléphone est obligatoire.',
            'phone.regex'         => 'Format invalide. Utilisez le format international marocain : +212 06XXXXXXXX ou +212 6XXXXXXXX.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'first_name' => trim($this->first_name),
            'last_name' => trim($this->last_name),
            'email' => strtolower(trim($this->email)),
        ]);
    }
}
