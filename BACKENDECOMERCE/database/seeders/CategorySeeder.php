<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Maquillage', 'section_id' => 1, 'slug' => 'maquillage'],
            ['name' => 'Parfum femme', 'section_id' => 1, 'slug' => 'parfum-femme'],
            ['name' => 'Parfum homme', 'section_id' => 2, 'slug' => 'parfum-homme'],
            ['name' => 'Soin cheveux', 'section_id' => 1, 'slug' => 'soin-cheveux-femme'], // Slug change unique
            ['name' => 'Soin cheveux', 'section_id' => 2, 'slug' => 'soin-cheveux-homme'], // Slug change unique
            ['name' => 'Soin corps', 'section_id' => 2, 'slug' => 'soin-corps-homme'],   // Slug change unique
            ['name' => 'Soin corps', 'section_id' => 1, 'slug' => 'soin-corps-femme'],   // Slug change unique
            ['name' => 'Soin des mains', 'section_id' => 1, 'slug' => 'soin-des-mains'],
            ['name' => 'Soin enfant', 'section_id' => 3, 'slug' => 'soin-enfant'],
            ['name' => 'Soin visage', 'section_id' => 1, 'slug' => 'soin-visage-femme'],  // Slug change unique
            ['name' => 'Soin visage', 'section_id' => 2, 'slug' => 'soin-visage-homme'],  // Slug change unique
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name'], 'section_id' => $category['section_id']],
                $category
            );
        }
    }
}
