<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = ['name', 'slug', 'order', 'is_active'];

    // Lien vers les catégories via la table pivot section_category
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'section_category');
    }

    // Lien direct vers les produits
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}