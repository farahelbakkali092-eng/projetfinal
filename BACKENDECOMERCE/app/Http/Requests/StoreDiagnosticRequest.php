<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Requests\BaseApiRequest; // <-- 1. Importer ta classe de base

class StoreDiagnosticRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 3. Modifier le Regex pour accepter les accents (ex: Chloé)
            'prenom' => ['required', 'string', 'regex:/^[\pL\s\-\']+$/u'], 
            'age' => ['required', 'integer', 'min:12', 'max:120'],
            'email' => ['required', 'email'],
            'type_peau' => ['required', 'string', 'in:Sèche,Normale,Mixte,Grasse'],
            'problematiques' => ['required', 'array', 'min:1'],
            'problematiques.*' => ['string'],
            'preferences' => ['required', 'array', 'min:1'],
            'preferences.*' => ['string'],
            'budget' => ['required', 'string', 'in:eco,premium,luxe'],
        ];
    }

    public function messages(): array
    {
        return [
            'prenom.regex' => 'Le prénom ne doit contenir que des lettres.',
            'age.integer' => 'L\'âge doit être un nombre valide.',
            'age.min' => 'Vous devez avoir au moins 12 ans.',
            'email.email' => 'Format d\'email invalide.',
            'type_peau.required' => 'Veuillez sélectionner votre type de peau.',
            'problematiques.min' => 'Veuillez sélectionner au moins une préoccupation.',
            'preferences.min' => 'Veuillez sélectionner au moins une préférence.',
            'budget.required' => 'Veuillez définir votre budget.',
        ];
    }
}