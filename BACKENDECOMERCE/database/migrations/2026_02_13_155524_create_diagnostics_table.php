<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('diagnostics', function (Blueprint $table) {
        $table->id();
        $table->string('prenom');
        $table->integer('age');
        $table->string('email');
        $table->string('type_peau');
        
        // Utiliser 'json' pour stocker les tableaux (checkboxes)
        $table->json('problematiques'); 
        $table->json('preferences');
        
        $table->string('budget');
        $table->timestamps();
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Ligne à ajouter !
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostics');
    }
};
