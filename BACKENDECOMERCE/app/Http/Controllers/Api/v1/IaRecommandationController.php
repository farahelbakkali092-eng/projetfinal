<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Product;

class IaRecommandationController extends Controller
{
    use ApiResponseTrait;

    /**
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
        'acné'             => ['purifiant', 'anti-imperfections', 'nettoyant', 'salicylique'],
        'imperfections'    => ['purifiant', 'anti-imperfections', 'nettoyant'],
        'rides'            => ['anti-âge', 'lissant', 'fermeté', 'collagène', 'rétinol'],
        'âge'              => ['anti-âge', 'lissant', 'fermeté', 'collagène'],
        'taches'           => ['éclat', 'unifiant', 'correcteur', 'sérum', 'vitamine c'],
        'pigmentaires'     => ['éclat', 'unifiant', 'correcteur'],
        'déshydratation'   => ['hydratant', 'hyaluronique', 'sérum', 'eau'],
        'rougeurs'         => ['apaisant', 'calmant', 'anti-rougeur', 'doux'],
        'pores'            => ['pores', 'purifiant', 'matifiant', 'nettoyant'],
    ];

    /**
     * Génère une routine personnalisée via IA et retourne des produits du catalogue.
     */
    public function generateRoutine(Request $request)
    {
        $request->validate([
            'type_peau'      => 'required|string|max:50',
            'problematiques' => 'required|array|min:1',
            'preferences'    => 'nullable|array',
            'budget'         => 'required|numeric|min:1',
            'nom'            => 'nullable|string|max:100',
            'prenom'         => 'nullable|string|max:100',
            'age'            => 'nullable|integer|min:10|max:120',
        ]);

        $typePeau      = $request->input('type_peau');
        $problematiques = $request->input('problematiques', []);
        $preferences   = $request->input('preferences', []);
        $budget        = (float) $request->input('budget');
        $apiKey        = config('services.gemini.key');

        // ── Étape 1 : Appel Gemini pour obtenir des search_terms ciblés ────────
        $searchTerms = [];
        $routineAdvice = null;

        if ($apiKey) {
            $problemList   = implode(', ', $problematiques);
            $prefList      = implode(', ', $preferences);

            $prompt = <<<EOT
Tu es une experte dermatologue et conseillère en cosmétiques. Une cliente remplit un formulaire de diagnostic.

Données du profil :
- Type de peau : {$typePeau}
- Problématiques : {$problemList}
- Préférences : {$prefList}
- Budget : {$budget} dhs

Génère une réponse JSON stricte (sans markdown, sans texte autour) avec ce format :
{
  "search_terms": ["terme1", "terme2", "terme3", "terme4", "terme5", "terme6"],
  "routine_steps": ["Étape matin : ...", "Étape soir : ..."],
  "advice": "Conseil personnalisé court (2 phrases max)"
}

Règles :
- search_terms : 5-8 mots-clés cosmétiques en français correspondant aux PRODUITS adaptés (types : sérum, crème, nettoyant, masque, exfoliant... + bénéfices : hydratant, purifiant, anti-âge...)
- Ne pas répéter les symptômes, seulement les solutions produits
- routine_steps : 2-3 étapes concrètes pour la routine
- advice : conseil empathique et professionnel
EOT;

            try {
                $response = Http::timeout(12)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [[
                            'parts' => [['text' => $prompt]],
                        ]],
                        'generationConfig' => [
                            'temperature'     => 0.4,
                            'maxOutputTokens' => 400,
                        ],
                    ]
                );

                if ($response->successful()) {
                    $rawText = $response->json('candidates.0.content.parts.0.text', '');
                    $rawText = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($rawText));
                    $parsed  = json_decode($rawText, true);

                    if (is_array($parsed)) {
                        $searchTerms   = $parsed['search_terms'] ?? [];
                        $routineAdvice = $parsed['advice'] ?? null;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('IaRecommandation - Gemini error: ' . $e->getMessage());
            }
        }

        // ── Étape 2 : Fallback local si Gemini indisponible ───────────────────
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

        // ── Étape 3 : Recherche produits dans le catalogue ────────────────────
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

        // Fallback : si strict (avec préfs + budget) ne retourne rien, relâcher les préfs
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

        // Fallback final : budget uniquement
        if ($products->isEmpty()) {
            $products = Product::with(['images', 'category', 'brand'])
                ->where('stock', '>', 0)
                ->where('price', '<=', $budget)
                ->inRandomOrder()
                ->limit(4)
                ->get();
        }

        // ── Étape 4 : Formater la réponse ─────────────────────────────────────
        $formattedProducts = $products->map(function ($p) {
            $mainImg = $p->images->firstWhere('is_main', true) ?? $p->images->first();

            // Build image URL
            $imageUrl = null;
            if ($mainImg) {
                $imageUrl = $mainImg->image_url
                    ?? (config('app.url') . '/storage/' . $mainImg->image_path);
            }

            return [
                'id'          => $p->id,
                'nom'         => $p->name,
                'description' => \Str::limit($p->description ?? '', 100),
                'prix'        => $p->price,
                'prix_promo'  => $p->price_sold,
                'image'       => $imageUrl,
                'categorie'   => $p->category?->name,
                'marque'      => $p->brand?->name,
            ];
        });

        return $this->successResponse([
            'success'         => true,
            'recommendations' => $formattedProducts,
            'advice'          => $routineAdvice ?? "Votre routine personnalisée a été générée selon votre profil de peau.",
            'count'           => $formattedProducts->count(),
        ], 'Routine générée avec succès');
    }
}
