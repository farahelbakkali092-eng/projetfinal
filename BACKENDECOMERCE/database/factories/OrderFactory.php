<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => 'ORD-' . strtoupper($this->faker->unique()->bothify('??####')),
            'user_id' => \App\Models\User::inRandomOrder()->first()?->id,
            'total_price' => 0, // Calculated in seeder
            'status' => $this->faker->randomElement(['completed', 'completed', 'completed', 'pending', 'cancelled']),
            'payment_method' => $this->faker->randomElement(['stripe', 'cod', 'paypal']),
            'payment_status' => 'paid',
            'shipping_address' => $this->faker->address(),
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
