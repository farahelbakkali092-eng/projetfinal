<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cosmeticTypes = ['Sérum', 'Crème Hydra', 'Huile Éclat', 'Nettoyant Doux', 'Masque Argile', 'Tonique Bio', 'Gommage'];
        $name = $this->faker->randomElement($cosmeticTypes) . ' ' . $this->faker->word() . ' ' . $this->faker->numberBetween(1, 100);
        $price = $this->faker->randomFloat(2, 80, 1200);
        $discount = $this->faker->randomElement([0, 0, 0, 10, 20, 30, 50]);
        $priceSold = $discount > 0 ? $price * (1 - $discount / 100) : $price;

        return [
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'description' => $this->faker->paragraphs(2, true),
            'price' => $price,
            'price_sold' => $priceSold,
            'discount' => $discount,
            'stock' => $this->faker->numberBetween(0, 50),
            'category_id' => \App\Models\Category::inRandomOrder()->first()?->id,
            'brand_id' => \App\Models\Brand::inRandomOrder()->first()?->id,
            'section_id' => \App\Models\Section::inRandomOrder()->first()?->id,
        ];
    }
}
