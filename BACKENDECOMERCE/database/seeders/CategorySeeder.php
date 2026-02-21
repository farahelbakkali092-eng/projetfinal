<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Skincare', 'slug' => 'skincare'],
            ['name' => 'Makeup', 'slug' => 'makeup'],
            ['name' => 'Haircare', 'slug' => 'haircare'],
            ['name' => 'Fragrance', 'slug' => 'fragrance'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
