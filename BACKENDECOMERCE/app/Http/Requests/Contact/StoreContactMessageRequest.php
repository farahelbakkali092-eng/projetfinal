<?php

namespace App\Http\Requests\Contact;

// نستخدم الكلاس الخاص بك لتوحيد استجابات الـ API
use App\Http\Requests\BaseApiRequest;

class StoreContactMessageRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Dans la méthode rules() :
        $allowedChars = '/^[\pL\pN\s.,?!\'-]+$/u'; // <-- Accepte les accents de toutes les langues !

        return [
            'name' => [
                'required', 'string', 'min:2', 'max:50', // max:50 car 20 c'est court pour Nom + Prénom
                'regex:/^[\pL\s\-\']+$/u' // <-- Accepte les accents et apostrophes (ex: O'Connor)
            ],
            // ... le reste est bon, n'oublie pas d'appliquer $allowedChars à subject et message ...
            'email' => ['required', 'email', 'max:255'],
            'subject' => [
                'required', 
                'string', 
                'min:3', 
                'max:100', 
                'regex:' . $allowedChars
            ],
            'message' => [
                'required', 
                'string', 
                'min:10', 
                'max:1000', 
                'regex:' . $allowedChars
            ],
        ];
    }

    public function messages(): array
    {
      
        return [
            'name.required' => 'Le nom est obligatoire.',
            'name.regex' => 'Le nom ne doit contenir que des lettres.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'Le format de l\'email est invalide.',
            'subject.required' => 'Le sujet est obligatoire.',
            'message.required' => 'Le message ne peut pas être vide.',
            'message.min' => 'Votre message est trop court (10 caractères min).',
        ];
    }
}