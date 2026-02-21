<?php
return [
    // Ajoute bien l'étoile '*' pour t'assurer que toutes les routes passent
    'paths' => ['*', 'api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // CECI EST LA LIGNE LA PLUS IMPORTANTE : Elle autorise les cookies
    'supports_credentials' => true,
];