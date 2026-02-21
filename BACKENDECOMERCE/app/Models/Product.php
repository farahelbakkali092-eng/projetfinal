<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'price_sold', 'discount',
        'stock', 'category_id', 'brand_id', 'section_id' // Remplacé skin_type_id par section_id
    ];

    /**
     * Scope pour les produits en promotion
     */
    public function scopeOnSale($query)
    {
        return $query->where(function ($q) {
            $q->where('discount', '>', 0)
              ->orWhere(function ($sq) {
                  $sq->whereNotNull('price_sold')
                     ->whereColumn('price_sold', '<', 'price');
              });
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
        public function section()
        {
            return $this->belongsTo(Section::class);
        }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
