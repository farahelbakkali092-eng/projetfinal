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
    Schema::create('carts', function (Blueprint $table) {
        $table->id();
        // 👇 Peut être null si l'utilisateur n'est pas connecté
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); 
        // 👇 Pour identifier les invités (cookies)
        $table->string('session_id')->nullable(); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
