<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    protected $operator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->operator = config('database.default') === 'pgsql' ? 'ILIKE' : 'LIKE';
    }

    public function test_product_search_by_name_brand_and_category()
    {
        $category = Category::create([
            'name' => 'Skin Care',
            'slug' => 'skin-care',
            'description' => 'All skin care products'
        ]);

        $brand = Brand::create([
            'name' => 'Luxury Glow',
            'slug' => 'luxury-glow',
            'description' => 'Luxury brand for glow'
        ]);

        $product = Product::create([
            'name' => 'Hydrating Cream',
            'slug' => 'hydrating-cream',
            'description' => 'A very hydrating cream',
            'price' => 29.99,
            'stock' => 10,
            'category_id' => $category->id,
            'brand_id' => $brand->id
        ]);

        // Search for product name "Hydrating"
        $response = $this->getJson('/api/v1/products?search=Hydrating');
        $response->assertStatus(200)
                 ->assertJsonPath('data.data.0.name', 'Hydrating Cream');

        // Search for brand name "Luxury"
        $response = $this->getJson('/api/v1/products?search=Luxury');
        $response->assertStatus(200)
                 ->assertJsonPath('data.data.0.name', 'Hydrating Cream');

        // Search for category name "Skin"
        $response = $this->getJson('/api/v1/products?search=Skin');
        $response->assertStatus(200)
                 ->assertJsonPath('data.data.0.name', 'Hydrating Cream');
    }
}
