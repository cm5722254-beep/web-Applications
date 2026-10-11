<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('title_en')->nullable();
            $table->string('title_km')->nullable();
            $table->unsignedSmallInteger('season_number')->default(1);
            $table->text('synopsis_en')->nullable();
            $table->text('synopsis_km')->nullable();
            $table->string('poster_url')->nullable();
            $table->enum('status', ['draft', 'published', 'unlisted'])->default('draft');
            $table->date('aired_from')->nullable();
            $table->date('aired_to')->nullable();
            $table->unsignedSmallInteger('total_episodes')->nullable();
            $table->timestamps();

            $table->unique(['anime_id', 'season_number']);
            $table->unique(['anime_id', 'slug']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seasons');
    }
};
