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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            // 1. On enlève le ->unique() ici
<<<<<<< HEAD
            $table->string('name'); 
=======
            $table->string('name');
>>>>>>> 436bb6a (chore: update category validation rules and frontend sync)
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            // 2. On ajoute l'unicité composite à la fin
            $table->unique(['name', 'section_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};