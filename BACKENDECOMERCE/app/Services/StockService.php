<?php

namespace App\Services;

use App\Models\Product;
use Exception;

class StockService
{
    /**
     * Check if product has enough stock
     */
    public function hasStock(Product $product, int $quantity): bool
    {
        return $product->stock >= $quantity;
    }

    /**
     * Decrement stock for a product
     */
    public function decrementStock(Product $product, int $quantity)
    {
        if (!$this->hasStock($product, $quantity)) {
            throw new Exception("Insufficient stock for product: {$product->name}");
        }

        $product->decrement('stock', $quantity);
    }

    /**
     * Increment stock (e.g. on cancellation)
     */
    public function incrementStock(Product $product, int $quantity)
    {
        $product->increment('stock', $quantity);
    }
}
