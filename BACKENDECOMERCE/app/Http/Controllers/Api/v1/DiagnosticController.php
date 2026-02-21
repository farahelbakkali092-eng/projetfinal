<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDiagnosticRequest;
use App\Models\Diagnostic;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class DiagnosticController extends Controller
{
    use ApiResponseTrait;

    /**
     * Enregistrer un nouveau diagnostic client.
     *
     * @param StoreDiagnosticRequest $request
     * @return JsonResponse
     */
    public function store(StoreDiagnosticRequest $request): JsonResponse
    {
        // 1. Récupérer les données validées
        // Grâce à StoreDiagnosticRequest, si on arrive ici, c'est que tout est valide.
        $validatedData = $request->validated();

        // 2. Créer l'enregistrement en base de données
        // Laravel va automatiquement convertir les tableaux (problematiques, preferences)
        // en JSON si le modèle est bien configuré (voir étape suivante ci-dessous).
        $diagnostic = Diagnostic::create($validatedData);

        // 3. Retourner la réponse JSON standardisée
        return $this->successResponse(
            $diagnostic, 
            'Votre diagnostic a été reçu avec succès. Nos experts l\'analysent.', 
            201
        );
    }
}