<?php

namespace App\Repositories;

use App\Models\Product;

// 1. On hérite du BaseRepository
class ProductRepository extends BaseRepository
{
    public function __construct(Product $model)
    {
        parent::__construct($model); // On passe le modèle au parent
    }

    // SUPPRIME LES MÉTHODES find(), create() et delete() car elles sont déjà dans le BaseRepository !

    public function search(array $filters)
    {
        // ... Ton code actuel pour search() est très bien ...
    }

    public function bestSellers($limit = 8)
    {
        return $this->model->query()
            ->with(['category', 'brand', 'images'])
            ->limit($limit)
            ->get();
    }

    public function onSale($limit = 8)
    {
        return $this->model->query()
            ->onSale() // 2. MAGIQUE : On utilise le scope défini dans ton Modèle Product !
            ->with(['category', 'brand', 'images'])
            ->limit($limit)
            ->get();
    }
}