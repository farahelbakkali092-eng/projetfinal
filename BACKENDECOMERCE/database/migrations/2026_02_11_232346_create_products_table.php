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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description'); // text instead of string because of max 255/sanitize req
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->foreignId('category_id')->constrained('categories');
            $table->foreignId('brand_id')->constrained('brands');
             $table->foreignId('section_id')->constrained('sections');
            // ✅ COLLEZ ICI VOS NOUVELLES COLONNES
        $table->decimal('price_sold', 10, 2)->nullable();
        $table->integer('discount')->default(0);
            $table->timestamps();
        });

    }

    public function down(): void
    {

        Schema::dropIfExists('products');
    }
};
