<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // database/migrations/xxxx_create_menu_sections_tables.php
public function up()
{
    // 1. Table des Sections (Homme, Femme, etc.)
    Schema::create('sections', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Ex: Homme, Femme
        $table->string('slug')->unique(); // Ex: homme, femme
        $table->integer('order')->default(0); // Pour trier l'affichage
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });

    // 2. Table Pivot (Lien entre Section et vos Catégories existantes)
    // Cela ne touche PAS à votre table 'categories' d'origine !
    Schema::create('section_category', function (Blueprint $table) {
        $table->id();
        $table->foreignId('section_id')->constrained()->onDelete('cascade');
        
        // On assume que votre table existante s'appelle 'categories'
        $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
        
        $table->timestamps();
    });
}
public function down(): void
{
    Schema::dropIfExists('section_category');
    Schema::dropIfExists('sections');
}
};
