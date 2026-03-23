<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Product;

class ChatController extends Controller
{
    use ApiResponseTrait;

    /**
     * Skin concern → cosmetic synonym mapping for smarter DB search
     * Even if Gemini is unavailable, this helps understand common user phrases
     */
    private const SKIN_SYNONYMS = [
        'grasse'      => ['matifiant', 'purifiant', 'séborégulateu', 'pores'],
        'acné'        => ['purifiant', 'anti-imperfections', 'nettoyant', 'sérum'],
        'boutons'     => ['purifiant', 'anti-imperfections', 'nettoyant'],
        'taches'      => ['éclat', 'unifiant', 'correcteur', 'sérum'],
        'sensible'    => ['apaisant', 'doux', 'réparateur', 'calmant'],
        'sèche'       => ['hydratant', 'nourrissant', 'riche', 'crème'],
        'rides'       => ['anti-âge', 'lissant', 'fermeté', 'collagène'],
        'brillance'   => ['matifiant', 'purifi', 'pores'],
        'terne'       => ['éclat', 'lumineux', 'vitamine c'],
        'rougeur'     => ['apaisant', 'calmant', 'anti-rougeur'],
        'mixte'       => ['équilibrant', 'sebum', 'purifiant'],
        'hydrat'      => ['hydratant', 'eau', 'sérum', 'hyaluronique'],
    ];

    /**
     * Gender → product keyword mapping for targeted filtering
     */
    private const GENDER_KEYWORDS = [
        'homme' => ['homme', 'men', 'man', 'masculin', 'barbe', 'rasage', 'after-shave', 'aftershave'],
        'femme' => ['femme', 'women', 'woman', 'féminin', 'maquillage', 'mascara', 'rouge', 'blush', 'fond de teint'],
    ];

    public function recommend(Request $request)
    {
        $request->validate([
            'message' => 'required|string|min:3|max:500',
            'gender'  => 'nullable|string|in:homme,femme',
        ]);

        $userMessage = $request->input('message');
        $gender      = $request->input('gender'); // 'homme', 'femme', or null
        $apiKey      = config('services.gemini.key');

        // Build gender context string for the prompt
        $genderContext = '';
        if ($gender === 'homme') {
            $genderContext = "\nIMPORTANT : Le client est un HOMME. Recommande uniquement des produits de soin masculins ou mixtes. Les search_terms doivent inclure des termes comme « homme », « masculin », « men ». Évite tout produit exclusivement féminin (maquillage, mascara, etc.).";
        } elseif ($gender === 'femme') {
            $genderContext = "\nIMPORTANT : La cliente est une FEMME. Recommande des produits de soin féminins ou mixtes. Les search_terms peuvent inclure des termes comme « femme », « féminin », « women ».";
        }

        // ── Step 1: Deep semantic analysis via Gemini ──────────────────────
        $analysis   = null;
        $replyIntro = null;

        if ($apiKey) {
            $prompt = <<<EOT
Tu es une experte en cosmétiques et soins de la peau. Un client décrit son problème de peau ou son besoin beauté.

Analyse son message en profondeur et réponds avec un objet JSON strict (sans markdown, sans texte autour).

Format JSON attendu:
{
  "skin_type": "type de peau identifié ou null",
  "concerns": ["problème1", "problème2"],
  "product_categories": ["catégorie produit adaptée"],
  "search_terms": ["terme1 en français", "terme2", "terme3", "terme4", "terme5"],
  "reply_intro": "Réponse chaleureuse courte (1-2 phrases) qui montre que tu as compris le problème, sans proposer encore les produits",
  "no_match_message": "Message si aucun produit trouvé (1 phrase)"
}

Règles importantes:
- search_terms doit contenir 5 à 8 termes cosmétiques précis en français qui correspondent aux produits adaptés
- Inclure : types de soins (sérum, crème, masque, nettoyant...), bénéfices (purifiant, hydratant, apaisant...)
- Ne pas inclure les symptômes du patient dans search_terms, seulement les SOLUTIONS cosmétiques
- reply_intro doit être empathique et personnalisé, comme une vraie conseillère beauté
- Si l'utilisateur dit ne pas connaître son type de peau, propose des produits universels et doux
{$genderContext}

Message du client: "{$userMessage}"
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
                        $analysis   = $parsed;
                        $replyIntro = $parsed['reply_intro'] ?? null;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini API error: ' . $e->getMessage());
            }
        }

        // ── Step 2: Build search terms ──────────────────────────────────────
        $searchTerms = [];

        if ($analysis && !empty($analysis['search_terms'])) {
            $searchTerms = $analysis['search_terms'];
        } else {
            // Fallback: local synonym expansion from user message
            $lower = mb_strtolower($userMessage);
            foreach (self::SKIN_SYNONYMS as $trigger => $synonyms) {
                if (str_contains($lower, $trigger)) {
                    $searchTerms = array_merge($searchTerms, $synonyms);
                }
            }
            $searchTerms = array_merge($searchTerms, array_filter(
                explode(' ', preg_replace('/[^a-zàâäéèêëîïôùûüç ]/i', ' ', $lower)),
                fn($w) => strlen($w) >= 4
            ));
        }

        // Always add the gender keyword itself to search terms if gender is provided
        if ($gender) {
            $searchTerms[] = $gender;
        }

        $searchTerms = array_unique(array_filter($searchTerms));

        // ── Step 3: Smart product search ───────────────────────────────────
        $query = Product::with(['images', 'category', 'brand'])
            ->where('stock', '>', 0);

        // Filter by category name if Gemini identified categories
        if (!empty($analysis['product_categories'])) {
            $query->whereHas('category', function ($q) use ($analysis) {
                $q->where(function ($sub) use ($analysis) {
                    foreach ($analysis['product_categories'] as $cat) {
                        $sub->orWhere('name', 'LIKE', "%{$cat}%");
                    }
                });
            });
        }

        // Search in name + description using all terms
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

        // ── Step 3b: Gender keyword filter (when gender specified) ──────────
        // Try a gender-aware query first; fall back to neutral if empty results
        if ($gender && isset(self::GENDER_KEYWORDS[$gender])) {
            $genderTerms = self::GENDER_KEYWORDS[$gender];

            $genderedQuery = clone $query;
            $genderedQuery->where(function ($q) use ($genderTerms) {
                foreach ($genderTerms as $term) {
                    $q->orWhere('name', 'LIKE', "%{$term}%")
                      ->orWhere('description', 'LIKE', "%{$term}%");
                }
            });

            $products = $genderedQuery->limit(4)->get();

            // If the strict gender filter found nothing, fall back to the broader query
            if ($products->isEmpty()) {
                $products = $query->limit(4)->get();
            }
        } else {
            $products = $query->limit(4)->get();
        }

        // If category filter returned nothing, retry without it (broader search)
        if ($products->isEmpty() && !empty($analysis['product_categories'])) {
            $fallbackQuery = Product::with(['images', 'category', 'brand'])
                ->where('stock', '>', 0)
                ->where(function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        $term = trim($term);
                        if (strlen($term) < 3) continue;
                        $q->orWhere('name', 'LIKE', "%{$term}%")
                          ->orWhere('description', 'LIKE', "%{$term}%");
                    }
                });

            $products = $fallbackQuery->limit(4)->get();
        }

        // ── Step 4: Format response ─────────────────────────────────────────
        $formattedProducts = $products->map(function ($p) {
            $mainImg = $p->images->firstWhere('is_main', true) ?? $p->images->first();
            return [
                'id'          => $p->id,
                'name'        => $p->name,
                'description' => \Str::limit($p->description, 90),
                'price'       => $p->price,
                'price_sold'  => $p->price_sold,
                'image_url'   => $mainImg?->image_url,
                'category'    => $p->category?->name,
            ];
        });

        // Build final reply
        if ($formattedProducts->isEmpty()) {
            $reply = $analysis['no_match_message']
                ?? "Je n'ai pas trouvé de produit exactement adapté à ce besoin dans notre catalogue. N'hésitez pas à parcourir nos catégories ou à reformuler votre besoin !";
        } else {
            $count  = $formattedProducts->count();
            $suffix = "J'ai sélectionné {$count} produit" . ($count > 1 ? 's' : '') . " adaptés pour vous :";
            $reply  = $replyIntro ? "{$replyIntro}\n\n{$suffix}" : $suffix;
        }

        return $this->successResponse([
            'reply'    => $reply,
            'products' => $formattedProducts,
        ], 'Recommendation ready');
    }
}
