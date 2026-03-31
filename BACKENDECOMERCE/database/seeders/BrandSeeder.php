<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            // Soin / Dermo
            ['name' => 'Garnier', 'slug' => 'garnier', 'description' => 'Des soins d\'origine naturelle pour la peau et les cheveux.'],
            ['name' => 'L\'Oréal Paris', 'slug' => 'loreal-paris', 'description' => 'L\'expertise beauté globale accessible à tous.'],
            ['name' => 'Clinique', 'slug' => 'clinique', 'description' => 'Soins testés par des dermatologues, 100% sans parfum.'],
            ['name' => 'Nivea', 'slug' => 'nivea', 'description' => 'L\'expert mondial des soins hydratants pour toute la famille.'],
            
            // Maquillage Drugstore
            ['name' => 'Maybelline New York', 'slug' => 'maybelline-new-york', 'description' => 'Le maquillage numéro 1 dans le monde, inspiré des tendances new-yorkaises.'],
            ['name' => 'NYX Professional Makeup', 'slug' => 'nyx-professional-makeup', 'description' => 'Maquillage professionnel cruelty-free aux pigments intenses.'],
            ['name' => 'Essence', 'slug' => 'essence', 'description' => 'Des produits de maquillage fun, de qualité et à petits prix.'],
            ['name' => 'Revolution Beauty', 'slug' => 'revolution-beauty', 'description' => 'Du maquillage innovant et accessible, champion du rapport qualité/prix.'],
            
            // Best-sellers prestige / Luxe
            ['name' => 'Fenty Beauty', 'slug' => 'fenty-beauty', 'description' => 'La marque inclusive de Rihanna pour toutes les carnations.'],
            ['name' => 'Rare Beauty', 'slug' => 'rare-beauty', 'description' => 'Maquillage aérien et lumineux créé par Selena Gomez.'],
            ['name' => 'Charlotte Tilbury', 'slug' => 'charlotte-tilbury', 'description' => 'L\'exigence du tapis rouge pour une peau éclatante et un maquillage parfait.'],
            ['name' => 'Huda Beauty', 'slug' => 'huda-beauty', 'description' => 'Des palettes iconiques et des looks glamour créés par Huda Kattan.'],
            ['name' => 'MAC Cosmetics', 'slug' => 'mac-cosmetics', 'description' => 'L\'autorité mondiale en matière de maquillage professionnel.'],
            
            // Parfumerie & Soins Haut de Gamme
            ['name' => 'Dior', 'slug' => 'dior', 'description' => 'L\'élégance française incarnée dans des parfums et soins d\'exception.'],
            ['name' => 'Lancôme', 'slug' => 'lancome', 'description' => 'La beauté à la française : soins anti-âge, maquillage et parfums.'],
            ['name' => 'Yves Saint Laurent', 'slug' => 'yves-saint-laurent', 'description' => 'L\'audace et le luxe dans des produits de beauté iconiques.'],
            ['name' => 'Estée Lauder', 'slug' => 'estee-lauder', 'description' => 'Des soins réparateurs haute performance et du maquillage de luxe.'],
            
            // Soin Bébé
            ['name' => 'Mustela', 'slug' => 'mustela', 'description' => 'L\'expert de la peau des bébés et des mamans depuis plus de 70 ans.'],
            ['name' => 'Klorane', 'slug' => 'klorane', 'description' => 'Soins botaniques pour toute la famille, avec une gamme experte pour bébé.'],
            ['name' => 'Uriage', 'slug' => 'uriage', 'description' => 'L\'Eau Thermale des Alpes pour protéger les peaux sensibles, dès la naissance.'],
            ['name' => 'Biolane', 'slug' => 'biolane', 'description' => 'Des produits d\'hygiène et de soin doux pour la peau des bébés.'],
            
            // Soin Cheveux
            ['name' => 'Kérastase', 'slug' => 'kerastase', 'description' => 'Des soins capillaires de luxe sur-mesure pour tous les types de cheveux.'],
            ['name' => 'Olaplex', 'slug' => 'olaplex', 'description' => 'La technologie brevetée qui répare les liaisons capillaires endommagées.'],
            ['name' => 'L\'Oréal Professionnel', 'slug' => 'loreal-professionnel', 'description' => 'L\'innovation capillaire utilisée par les coiffeurs du monde entier.'],
            ['name' => 'Shea Moisture', 'slug' => 'shea-moisture', 'description' => 'Des soins naturels enrichis en beurre de karité pour cheveux texturés.'],
            
            // Skincare Tendance & Clean Beauty
            ['name' => 'Paula\'s Choice', 'slug' => 'paulas-choice', 'description' => 'Des soins formulés à partir d\'ingrédients scientifiquement prouvés.'],
            ['name' => 'Drunk Elephant', 'slug' => 'drunk-elephant', 'description' => 'Des formulations biocompatibles pour une peau saine et équilibrée.'],
            ['name' => 'COSRX', 'slug' => 'cosrx', 'description' => 'Le meilleur de la K-Beauty avec des formules simples et très efficaces.'],
            ['name' => 'Weleda', 'slug' => 'weleda', 'description' => 'Cosmétiques naturels et bio à base de plantes médicinales.'],
            
            // Luxe, Parfums et Maquillage Iconique
            ['name' => 'Chanel', 'slug' => 'chanel', 'description' => 'L\'allure et le luxe ultime en parfumerie, maquillage et soins.'],
            ['name' => 'Tom Ford', 'slug' => 'tom-ford', 'description' => 'Des parfums audacieux et un maquillage d\'une sophistication absolue.'],
            ['name' => 'Guerlain', 'slug' => 'guerlain', 'description' => 'L\'art de la parfumerie et des cosmétiques d\'exception depuis 1828.'],
            ['name' => 'Armani Beauty', 'slug' => 'armani-beauty', 'description' => 'L\'élégance intemporelle traduite en textures innovantes et parfums inoubliables.'],
            ['name' => 'Benefit Cosmetics', 'slug' => 'benefit-cosmetics', 'description' => 'L\'expert incontesté du maquillage des sourcils avec une touche d\'humour.'],
            ['name' => 'NARS', 'slug' => 'nars', 'description' => 'Du maquillage professionnel provocateur, créatif et sans limites.'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['slug' => $brand['slug']], $brand);
        }
    }
}
