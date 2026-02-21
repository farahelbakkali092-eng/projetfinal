<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInputMiddleware
{
    /**
     * Les champs à ne PAS nettoyer (pour garder le HTML ou pour les mots de passe)
     */
    protected $except = [
        'password',
        'password_confirmation',
        'current_password',
        'description', // 👈 Très important pour garder le HTML des descriptions produits/catégories !
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        // array_walk_recursive parcourt tous les éléments, même dans les sous-tableaux
        array_walk_recursive($input, function (&$value, $key) {
            if (is_string($value) && !in_array($key, $this->except)) {
                $value = strip_tags(trim($value));
            }
        });

        $request->merge($input);

        return $next($request);
    }
}