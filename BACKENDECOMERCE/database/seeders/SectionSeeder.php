<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sessions = [
            ['id' => 1, 'name' => 'FEMME', 'slug' => 'femme', 'order' => 0, 'is_active' => true],
            ['id' => 2, 'name' => 'HOMME', 'slug' => 'homme', 'order' => 1, 'is_active' => true],
            ['id' => 3, 'name' => 'ENFANT', 'slug' => 'enfant', 'order' => 2, 'is_active' => true],
        ];

        foreach ($sessions as $session) {
            \App\Models\Section::updateOrCreate(
                ['id' => $session['id']],
                $session
            );
        }
    }
}
