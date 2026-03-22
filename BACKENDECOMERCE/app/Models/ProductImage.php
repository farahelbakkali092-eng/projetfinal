<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'image_path', 'thumb_path', 'is_main'];

    protected $appends = ['image_url', 'thumbnail_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->image_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        // Return thumb if available, fallback to full image
        $path = $this->thumb_path ?: $this->image_path;
        if (!$path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
