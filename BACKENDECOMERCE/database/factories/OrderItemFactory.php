<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = \App\Models\Product::inRandomOrder()->first();
        return [
            'order_id' => \App\Models\Order::inRandomOrder()->first()?->id,
            'product_id' => $product?->id,
            'quantity' => $this->faker->numberBetween(1, 4),
            'price' => $product?->price_sold ?? 100,
        ];
    }
}
