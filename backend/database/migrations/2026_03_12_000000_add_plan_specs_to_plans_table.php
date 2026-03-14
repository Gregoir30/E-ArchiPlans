<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table): void {
            $table->unsignedInteger('surface')->default(0)->after('description');
            $table->unsignedTinyInteger('rooms')->default(0)->after('surface');
            $table->unsignedTinyInteger('levels')->default(0)->after('rooms');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table): void {
            $table->dropColumn(['surface', 'rooms', 'levels']);
        });
    }
};
