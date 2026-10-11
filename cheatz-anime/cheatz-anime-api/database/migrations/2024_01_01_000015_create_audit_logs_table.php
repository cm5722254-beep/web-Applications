<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 100);         // e.g. 'anime.published', 'user.banned'
            $table->string('model_type')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');

            $table->index(['model_type', 'model_id']);
            $table->index(['user_id', 'created_at']);
            $table->index('action');
        });

        Schema::create('content_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();
            $table->string('provider');               // licensed content source
            $table->string('territory_code', 10)->default('*'); // '*' = worldwide
            $table->date('license_start')->nullable();
            $table->date('license_end')->nullable();
            $table->enum('playback_type', ['stream', 'download', 'both'])->default('stream');
            $table->json('allowed_regions')->nullable(); // ISO country codes
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['anime_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_licenses');
        Schema::dropIfExists('audit_logs');
    }
};
