<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watch_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('progress_seconds')->default(0);
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->boolean('completed')->default(false);
            $table->string('subtitle_language', 10)->nullable();
            $table->timestamp('last_watched_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'episode_id']);
            $table->index(['user_id', 'last_watched_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watch_histories');
    }
};
