<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
<<<<<<< HEAD
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
=======
>>>>>>> 436bb6a (chore: update category validation rules and frontend sync)

/**
 * IaRecommandationController
 *
 * Responsabilité : Générer des recommandations de produits skincare personnalisées.
 *
 * Flux :
 *  1. Validation des données du formulaire.
 *  2. Appel Gemini AI pour obtenir des termes de recherche ciblés (avec fallback local).
 *  3. Recherche des produits dans la base de données selon le profil et le budget.
 *  4. Retour des recommandations formatées à React.
 */
class IaRecommandationController extends Controller
{
    use ApiResponseTrait;

    /**
<<<<<<< HEAD
     * Mapping type de peau → mots-clés produits
     */
    private const SKIN_TYPE_KEYWORDS = [
        'sèche'       => ['hydratant', 'nourrissant', 'riche', 'crème', 'beurre', 'réparateur'],
        'grasse'      => ['matifiant', 'purifiant', 'séborégulateur', 'pores', 'léger', 'oil-free'],
        'mixte'       => ['équilibrant', 'matifiant', 'hydratant', 'zones'],
        'normale'     => ['hydratant', 'éclat', 'soin', 'quotidien'],
        'sensible'    => ['apaisant', 'doux', 'réparateur', 'calmant', 'hypoallergénique'],
        // EN fallbacks
        'dry'         => ['hydratant', 'nourrissant', 'riche', 'crème'],
        'oily'        => ['matifiant', 'purifiant', 'séborégulateur', 'léger'],
        'combination' => ['équilibrant', 'matifiant', 'hydratant'],
        'normal'      => ['hydratant', 'éclat', 'soin'],
        'sensitive'   => ['apaisant', 'doux', 'réparateur'],
    ];

    /**
     * Mapping problématiques → mots-clés produits
     */
    private const CONCERN_KEYWORDS = [
        'acné'           => ['purifiant', 'anti-imperfections', 'nettoyant', 'salicylique'],
        'imperfections'  => ['purifiant', 'anti-imperfections', 'nettoyant'],
        'rides'          => ['anti-âge', 'lissant', 'fermeté', 'collagène', 'rétinol'],
        'âge'            => ['anti-âge', 'lissant', 'fermeté', 'collagène'],
        'taches'         => ['éclat', 'unifiant', 'correcteur', 'sérum', 'vitamine c'],
        'pigmentaires'   => ['éclat', 'unifiant', 'correcteur'],
        'déshydratation' => ['hydratant', 'hyaluronique', 'sérum', 'eau'],
        'rougeurs'       => ['apaisant', 'calmant', 'anti-rougeur', 'doux'],
        'pores'          => ['pores', 'purifiant', 'matifiant', 'nettoyant'],
    ];

    /**
     * Génère une routine beauté personnalisée et retourne des produits du catalogue.
     *
     * Route : POST /api/v1/routine/recommend
     *
     * Body JSON attendu (depuis React) :
     * {
     *   "type_peau":      "Grasse",
     *   "budget":          200,
     *   "problematiques": ["Acné & Imperfections", "Pores Dilatés"],
     *   "preferences":    ["Bio / Naturel", "Vegan"],
     *   "nom":            "Douae",      // optionnel
     *   "prenom":         "B",          // optionnel
     *   "age":            25            // optionnel
     * }
     *
     * @param  Request  $request
     * @return JsonResponse
=======
     * Proxy la requête vers le microservice Flask IA.
     *
     * POST /api/v1/routine/recommend
     * → POST {FLASK_IA_URL}/api/routine
>>>>>>> 436bb6a (chore: update category validation rules and frontend sync)
     */
    public function generateRoutine(Request $request): JsonResponse
    {
<<<<<<< HEAD
        // ═══════════════════════════════════════════════
        // ÉTAPE 1 — Validation stricte des données entrantes
        // ═══════════════════════════════════════════════
        $validator = Validator::make($request->all(), [
            'type_peau'        => 'required|string|max:100',
            'budget'           => 'required|numeric|min:1|max:100000',
            'problematiques'   => 'required|array|min:1',
            'problematiques.*' => 'string|max:100',
            'preferences'      => 'nullable|array',
            'preferences.*'    => 'string|max:100',
            'nom'              => 'nullable|string|max:100',
            'prenom'           => 'nullable|string|max:100',
            'age'              => 'nullable|integer|min:10|max:120',
        ], [
            'type_peau.required'      => 'Le type de peau est obligatoire.',
            'budget.required'         => 'Le budget est obligatoire.',
            'budget.numeric'          => 'Le budget doit être un nombre.',
            'budget.min'              => 'Le budget doit être supérieur à 0.',
            'problematiques.required' => 'Veuillez choisir au moins une problématique.',
            'problematiques.min'      => 'Veuillez choisir au moins une problématique.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données du formulaire invalides.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $typePeau       = $data['type_peau'];
        $problematiques = $data['problematiques'];
        $preferences    = $data['preferences'] ?? [];
        $budget         = (float) $data['budget'];
        $apiKey         = config('services.gemini.key');

        // ═══════════════════════════════════════════════
        // ÉTAPE 2 — Appel Gemini AI pour des termes de recherche ciblés
        // ═══════════════════════════════════════════════
        $searchTerms   = [];
        $routineAdvice = null;

        if ($apiKey) {
            $problemList = implode(', ', $problematiques);
            $prefList    = implode(', ', $preferences);
=======
        // 1. Validation des champs du formulaire
        $validated = $request->validate([
            'type_peau'      => 'required|string|max:50',
            'problematiques' => 'required|array|min:1',
            'preferences'    => 'nullable|array',
            'budget'         => 'required|numeric|min:1',
            'nom'            => 'nullable|string|max:100',
            'prenom'         => 'nullable|string|max:100',
            'age'            => 'nullable|integer|min:10|max:120',
        ]);

        // 2. Lecture de l'URL du microservice Flask depuis .env
        $flaskUrl = rtrim(env('FLASK_IA_URL', 'http://127.0.0.1:5001'), '/');
        $endpoint = $flaskUrl . '/api/routine';

        // 3. Envoi de la requête HTTP POST vers Flask
        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->post($endpoint, $validated);

            // 4. Vérification de la réponse Flask
            if ($response->failed()) {
                Log::warning('Flask IA microservice returned an error', [
                    'status'   => $response->status(),
                    'body'     => $response->body(),
                    'endpoint' => $endpoint,
                ]);
>>>>>>> 436bb6a (chore: update category validation rules and frontend sync)

                return $this->errorResponse(
                    'Le microservice IA a retourné une erreur (HTTP ' . $response->status() . ').',
                    $response->status() >= 500 ? 503 : 422
                );
<<<<<<< HEAD

                if ($response->successful()) {
                    $rawText = $response->json('candidates.0.content.parts.0.text', '');
                    $rawText = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($rawText));
                    $parsed  = json_decode($rawText, true);

                    if (is_array($parsed)) {
                        $searchTerms   = $parsed['search_terms'] ?? [];
                        $routineAdvice = $parsed['advice']        ?? null;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('[IaRecommandation] Gemini indisponible : ' . $e->getMessage());
            }
        }

        // ═══════════════════════════════════════════════
        // ÉTAPE 3 — Fallback local si Gemini indisponible
        // Utilisé côté serveur uniquement, sans dépendance externe.
        // ═══════════════════════════════════════════════
        if (empty($searchTerms)) {
            $lower = mb_strtolower($typePeau);
            foreach (self::SKIN_TYPE_KEYWORDS as $key => $terms) {
                if (str_contains($lower, $key)) {
                    $searchTerms = array_merge($searchTerms, $terms);
                    break;
                }
            }
            foreach ($problematiques as $pb) {
                $lowerPb = mb_strtolower($pb);
                foreach (self::CONCERN_KEYWORDS as $key => $terms) {
                    if (str_contains($lowerPb, $key)) {
                        $searchTerms = array_merge($searchTerms, $terms);
                    }
                }
            }
        }

        $searchTerms = array_unique(array_filter($searchTerms));

        // ═══════════════════════════════════════════════
        // ÉTAPE 4 — Recherche des produits dans le catalogue
        // ═══════════════════════════════════════════════
        $query = Product::with(['images', 'category', 'brand'])
            ->where('stock', '>', 0);

        // Filtre budget
        if ($budget > 0) {
            $query->where('price', '<=', $budget);
        }

        // Filtre préférences (bio, vegan…)
        if (!empty($preferences)) {
            $query->where(function ($q) use ($preferences) {
                foreach ($preferences as $pref) {
                    $q->orWhere('name', 'LIKE', "%{$pref}%")
                      ->orWhere('description', 'LIKE', "%{$pref}%");
                }
            });
        }

        // Filtre search_terms
        if (!empty($searchTerms)) {
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $term = trim($term);
                    if (strlen($term) < 3) continue;
                    $q->orWhere('name', 'LIKE', "%{$term}%")
                      ->orWhere('description', 'LIKE', "%{$term}%");
                }
            });
        }

        $products = $query->limit(6)->get();

        // Fallback 1 : relâcher les préférences si aucun résultat
        if ($products->isEmpty() && !empty($preferences)) {
            $fallback = Product::with(['images', 'category', 'brand'])
                ->where('stock', '>', 0)
                ->where('price', '<=', $budget)
                ->where(function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        $term = trim($term);
                        if (strlen($term) < 3) continue;
                        $q->orWhere('name', 'LIKE', "%{$term}%")
                          ->orWhere('description', 'LIKE', "%{$term}%");
                    }
                })
                ->limit(6)
                ->get();

            $products = $fallback->isNotEmpty() ? $fallback : $products;
        }

        // Fallback 2 : budget uniquement si toujours vide
        if ($products->isEmpty()) {
            $products = Product::with(['images', 'category', 'brand'])
                ->where('stock', '>', 0)
                ->where('price', '<=', $budget)
                ->inRandomOrder()
                ->limit(4)
                ->get();
        }

        // Aucun produit trouvé même après tous les fallbacks
        if ($products->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun produit adapté à votre profil et budget pour le moment.',
            ], 200);
        }

        // ═══════════════════════════════════════════════
        // ÉTAPE 5 — Formatage de la réponse pour React
        // ═══════════════════════════════════════════════
        $formattedProducts = $products->map(function ($p) {
            $mainImg = $p->images->firstWhere('is_main', true) ?? $p->images->first();

            $imageUrl = null;
            if ($mainImg) {
                $imageUrl = $mainImg->image_url
                    ?? (config('app.url') . '/storage/' . $mainImg->image_path);
            }

            return [
                'id'          => $p->id,
                'nom'         => $p->name,
                'description' => Str::limit($p->description ?? '', 100),
                'prix'        => $p->price,
                'prix_promo'  => $p->price_sold,
                'image'       => $imageUrl,
                'categorie'   => $p->category?->name,
                'marque'      => $p->brand?->name,
            ];
        });

        Log::info('[IaRecommandation] Routine générée', [
            'type_peau' => $typePeau,
            'count'     => $formattedProducts->count(),
            'via_gemini'=> !empty($apiKey),
        ]);

        return $this->successResponse([
            'success'         => true,
            'recommendations' => $formattedProducts,
            'advice'          => $routineAdvice ?? 'Votre routine personnalisée a été générée selon votre profil de peau.',
            'count'           => $formattedProducts->count(),
        ], 'Routine générée avec succès');
=======
            }

            // 5. Récupération et retransmission de la réponse JSON Flask
            $data = $response->json();

            // Vérification que Flask a retourné success: true
            if (empty($data['success'])) {
                return $this->errorResponse(
                    $data['message'] ?? "Le microservice IA n'a pas pu générer de recommandations.",
                    422
                );
            }

            // 6. Retour au frontend dans le format attendu
            return $this->successResponse([
                'success'         => true,
                'recommendations' => $data['recommendations'] ?? [],
                'message'         => $data['message'] ?? 'Recommandations générées.',
                'count'           => $data['count'] ?? count($data['recommendations'] ?? []),
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // 7. Flask inaccessible (service éteint, mauvais port…)
            Log::error('Flask IA microservice unreachable', [
                'endpoint' => $endpoint,
                'error'    => $e->getMessage(),
            ]);

            return $this->errorResponse(
                'Le microservice IA est inaccessible. Assurez-vous que Flask tourne sur ' . $flaskUrl . '.',
                503
            );

        } catch (\Throwable $e) {
            Log::error('Unexpected error calling Flask IA', [
                'endpoint' => $endpoint,
                'error'    => $e->getMessage(),
            ]);

            return $this->errorResponse(
                'Erreur inattendue lors de la communication avec le microservice IA.',
                500
            );
        }
>>>>>>> 436bb6a (chore: update category validation rules and frontend sync)
    }
}
