<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiagnosticRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'             => ['required', 'string', 'regex:/^[\pL\s\-\']+$/u'],
            'prenom'          => ['required', 'string', 'regex:/^[\pL\s\-\']+$/u'],
            'age'             => ['required', 'integer', 'min:12', 'max:120'],
            'email'           => ['required', 'email'],
            'type_peau'       => ['required', 'string', 'in:Sèche,Normale,Mixte,Grasse'],
            'problematiques'  => ['required', 'array', 'min:1'],
            'problematiques.*'=> ['string'],
            'preferences'     => ['required', 'array', 'min:1'],
            'preferences.*'   => ['string'],
            'budget'          => ['required', 'numeric', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required'            => 'Le nom est requis.',
            'nom.regex'               => 'Le nom ne doit contenir que des lettres.',
            'prenom.required'         => 'Le prénom est requis.',
            'prenom.regex'            => 'Le prénom ne doit contenir que des lettres.',
            'age.integer'             => "L'âge doit être un nombre valide.",
            'age.min'                 => 'Vous devez avoir au moins 12 ans.',
            'email.required'          => "L'email est requis.",
            'email.email'             => "Format d'email invalide.",
            'type_peau.required'      => 'Veuillez sélectionner votre type de peau.',
            'problematiques.min'      => 'Veuillez sélectionner au moins une préoccupation.',
            'preferences.min'         => 'Veuillez sélectionner au moins une préférence.',
            'budget.required'         => 'Veuillez définir votre budget.',
            'budget.numeric'          => 'Le budget doit être un nombre (ex: 200).',
            'budget.min'              => 'Le budget doit être supérieur à 0.',
        ];
    }
}