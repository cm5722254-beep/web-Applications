<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name_en', 100)->unique();
            $table->string('name_km', 200)->nullable();
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // emoji or icon name
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('genres');
    }
};
