<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = ['name', 'slug', 'order', 'is_active'];

    // Lien vers les catégories
    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    // Lien direct vers les produits
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}