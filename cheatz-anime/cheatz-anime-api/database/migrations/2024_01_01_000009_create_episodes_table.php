<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('title_en')->nullable();
            $table->string('title_km')->nullable();
            $table->unsignedSmallInteger('episode_number');
            $table->text('synopsis_en')->nullable();
            $table->text('synopsis_km')->nullable();
            $table->string('thumbnail_url')->nullable();

            // Video source — server-side only, never exposed directly
            $table->string('video_source_provider')->nullable();  // 'animekill', 'manual', etc.
            $table->text('video_source_url')->nullable();          // encrypted or internal ref
            $table->unsignedInteger('duration_seconds')->nullable(); // episode length in seconds
            $table->boolean('has_hls')->default(false);

            $table->enum('status', ['draft', 'published', 'unlisted'])->default('draft');
            $table->boolean('is_premium')->default(false);
            $table->date('aired_at')->nullable();

            // Source tracking
            $table->string('source_provider')->nullable();
            $table->string('source_id')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['season_id', 'episode_number']);
            $table->unique(['season_id', 'slug']);
            $table->index('status');
            $table->index('is_premium');
            $table->index('aired_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
