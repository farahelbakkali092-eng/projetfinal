<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            ['name' => 'L\'Oreal', 'slug' => 'loreal'],
            ['name' => 'Estée Lauder', 'slug' => 'estee-lauder'],
            ['name' => 'Maybelline', 'slug' => 'maybelline'],
            ['name' => 'Clinique', 'slug' => 'clinique'],
        ];

        foreach ($brands as $brand) {
            \App\Models\Brand::updateOrCreate(
                ['name' => $brand['name']],
                $brand
            );
        }
    }
}
