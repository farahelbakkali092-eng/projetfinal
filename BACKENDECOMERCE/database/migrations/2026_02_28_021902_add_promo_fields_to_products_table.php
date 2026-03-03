<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'price_sold')) {
                $table->decimal('price_sold', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'discount')) {
                $table->unsignedTinyInteger('discount')->default(0)->after('price_sold');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['price_sold', 'discount']);
        });
    }
};
