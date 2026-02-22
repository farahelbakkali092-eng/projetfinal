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
            ['name' => 'Femmes', 'slug' => 'femmes', 'order' => 1],
            ['name' => 'Hommes', 'slug' => 'hommes', 'order' => 2],
            ['name' => 'Enfants', 'slug' => 'enfants', 'order' => 3],
        ];

        foreach ($sessions as $session) {
            \App\Models\Section::updateOrCreate(
                ['slug' => $session['slug']],
                $session
            );
        }
    }
}
