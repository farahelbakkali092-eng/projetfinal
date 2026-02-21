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
    Schema::create('addresses', function (Blueprint $table) {
        $table->id();
        // 👇 Lien avec l'utilisateur
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
        
        $table->string('full_name')->nullable();
        $table->string('address_line1');
        $table->string('address_line2')->nullable();
        $table->string('city');
        $table->string('state')->nullable();
        $table->string('postal_code');
        $table->string('country');
        $table->string('phone')->nullable();
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
