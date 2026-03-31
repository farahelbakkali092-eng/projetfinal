<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'image', 'section_id']; // image au lieu de image_path

    protected $appends = ['image_url'];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

   public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) { // ou image_path selon ta BDD
            return null;
        }

        // Utilise le helper asset() qui pointe vers le dossier public
        return asset('storage/' . $this->image); 
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
