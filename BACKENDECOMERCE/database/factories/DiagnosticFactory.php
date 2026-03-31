<?php

namespace Database\Factories;

use App\Models\Diagnostic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Diagnostic>
 */
class DiagnosticFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'prenom' => $this->faker->firstName(),
            'age' => $this->faker->numberBetween(18, 65),
            'email' => $this->faker->safeEmail(),
            'type_peau' => $this->faker->randomElement(['Grasse', 'Sèche', 'Mixte', 'Normale']),
            'problematiques' => ['Acné', 'Rides'],
            'preferences' => ['Bio', 'Vegan'],
            'budget' => $this->faker->numberBetween(100, 2000),
            'user_id' => \App\Models\User::inRandomOrder()->first()?->id,
            'created_at' => $this->faker->dateTimeBetween('-4 months', 'now'),
        ];
    }
}
