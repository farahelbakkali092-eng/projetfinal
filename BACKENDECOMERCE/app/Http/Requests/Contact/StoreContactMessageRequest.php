<?php

namespace App\Http\Requests\Contact;

use App\Http\Requests\BaseApiRequest;

class StoreContactMessageRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'min:2', 'max:100'],
            'email'   => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'min:3', 'max:200'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Le nom est obligatoire.',
            'name.min'         => 'Le nom doit contenir au moins 2 caractères.',
            'email.required'   => "L'email est obligatoire.",
            'email.email'      => "Le format de l'email est invalide.",
            'subject.required' => 'Le sujet est obligatoire.',
            'subject.min'      => 'Le sujet doit contenir au moins 3 caractères.',
            'message.required' => 'Le message ne peut pas être vide.',
            'message.min'      => 'Votre message est trop court (10 caractères min).',
        ];
    }
}