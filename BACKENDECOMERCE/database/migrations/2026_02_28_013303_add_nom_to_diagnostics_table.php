<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnostics', function (Blueprint $table) {
            // Add nom column if it doesn't exist
            if (!Schema::hasColumn('diagnostics', 'nom')) {
                $table->string('nom')->after('user_id')->nullable();
            }
            // Change budget from string to decimal to support numeric values
            $table->string('budget')->change();
        });
    }

    public function down(): void
    {
        Schema::table('diagnostics', function (Blueprint $table) {
            if (Schema::hasColumn('diagnostics', 'nom')) {
                $table->dropColumn('nom');
            }
        });
    }
};
