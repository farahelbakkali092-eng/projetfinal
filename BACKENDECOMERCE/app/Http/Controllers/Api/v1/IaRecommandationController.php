<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * IaRecommandationController
 *
 * Responsabilité UNIQUE : Agir comme un pur API Gateway entre React et Flask.
 * Ce contrôleur ne touche PAS à la base de données.
 * La sauvegarde du diagnostic en BDD est gérée par DiagnosticController.
 *
 * Flux : React ➜ Laravel (validation + gateway) ➜ Flask (TF-IDF IA) ➜ React
 */
class IaRecommandationController extends Controller
{
    /**
     * Génère une routine beauté personnalisée en interrogeant le microservice Flask IA.
     *
     * Route : POST /api/v1/routine/recommend
     *
     * Body JSON attendu (depuis React) :
     * {
     *   "type_peau":      "Grasse",
     *   "budget":          200,
     *   "problematiques": ["Acné & Imperfections", "Pores Dilatés"],
     *   "preferences":    ["Bio / Naturel", "Vegan"]
     * }
     *
     * Réponse JSON renvoyée à React :
     * {
     *   "success": true,
     *   "message": "...",
     *   "recommendations": [ ...3 produits... ],
     *   "count": 3
     * }
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function generateRoutine(Request $request): JsonResponse
    {
        // ═══════════════════════════════════════════════
        // ÉTAPE 1 — Validation stricte des données entrantes
        // Protège le microservice Flask contre des données corrompues.
        // ═══════════════════════════════════════════════
        $validator = Validator::make($request->all(), [
            'type_peau'      => 'required|string|max:100',
            'budget'         => 'required|numeric|min:1|max:100000',
            'problematiques' => 'required|array|min:1',
            'problematiques.*' => 'string|max:100',
            'preferences'    => 'required|array|min:1',
            'preferences.*'  => 'string|max:100',
        ], [
            // Messages d'erreur personnalisés en français
            'type_peau.required'       => 'Le type de peau est obligatoire.',
            'budget.required'          => 'Le budget est obligatoire.',
            'budget.numeric'           => 'Le budget doit être un nombre.',
            'budget.min'               => 'Le budget doit être supérieur à 0.',
            'problematiques.required'  => 'Veuillez choisir au moins une problématique.',
            'problematiques.min'       => 'Veuillez choisir au moins une problématique.',
            'preferences.required'     => 'Veuillez choisir au moins une préférence.',
            'preferences.min'          => 'Veuillez choisir au moins une préférence.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données du formulaire invalides.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // ═══════════════════════════════════════════════
        // ÉTAPE 2 — Construction du payload pour Flask
        // On ne transmet que ce dont l'IA a besoin.
        // ═══════════════════════════════════════════════
        $flaskPayload = [
            'type_peau'      => $data['type_peau'],
            'budget'         => (float) $data['budget'],
            'problematiques' => $data['problematiques'],
            'preferences'    => $data['preferences'],
        ];

        // URL du microservice Flask (configurée dans le fichier .env)
        // Exemple .env : FLASK_IA_URL=http://127.0.0.1:5001
        $flaskBaseUrl = rtrim(env('FLASK_IA_URL', 'http://127.0.0.1:5001'), '/');
        $flaskEndpoint = $flaskBaseUrl . '/api/routine';

        // ═══════════════════════════════════════════════
        // ÉTAPE 3 — Appel HTTP sécurisé vers Flask IA
        // ═══════════════════════════════════════════════
        try {
            Log::info('[IaGateway] Appel Flask IA', [
                'endpoint' => $flaskEndpoint,
                'payload'  => $flaskPayload,
            ]);

            $flaskResponse = Http::timeout(15)          // Timeout de 15 secondes
                ->withHeaders([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($flaskEndpoint, $flaskPayload);

            // ── Cas 1 : Flask a répondu mais avec une erreur (4xx / 5xx) ──
            if (!$flaskResponse->successful()) {
                Log::error('[IaGateway] Erreur Flask IA', [
                    'status'   => $flaskResponse->status(),
                    'body'     => $flaskResponse->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Le service de recommandation IA rencontre un problème. Veuillez réessayer.',
                ], 503);
            }

            $flaskData = $flaskResponse->json();

            // ── Cas 2 : Flask a répondu 200 mais sans recommandations ──
            if (empty($flaskData['success']) || empty($flaskData['recommendations'])) {
                Log::warning('[IaGateway] Flask a répondu sans recommandations', [
                    'flask_data' => $flaskData,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => $flaskData['message'] ?? 'Aucun produit skincare adapté à votre profil pour le moment.',
                ], 200);
            }

            // ── Cas 3 : Succès — on relaye les recommandations Flask à React ──
            Log::info('[IaGateway] Succès Flask IA', [
                'count' => $flaskData['count'] ?? count($flaskData['recommendations']),
            ]);

            return response()->json([
                'success'         => true,
                'message'         => 'Votre routine beauté personnalisée est prête !',
                'recommendations' => $flaskData['recommendations'],
                'count'           => $flaskData['count'] ?? count($flaskData['recommendations']),
            ], 200);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // ── Cas 4 : Flask est éteint ou injoignable (ConnectionException) ──
            Log::error('[IaGateway] Microservice Flask injoignable', [
                'error'    => $e->getMessage(),
                'endpoint' => $flaskEndpoint,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Le service de recommandation IA est actuellement hors ligne. Veuillez réessayer dans quelques instants.',
            ], 503);

        } catch (\Exception $e) {
            // ── Cas 5 : Erreur inattendue (catch-all de sécurité) ──
            Log::critical('[IaGateway] Erreur critique inattendue', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur interne est survenue. Veuillez contacter le support.',
            ], 500);
        }
    }
}
