<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subtitle_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->string('language_code', 10)->default('km'); // BCP 47
            $table->string('language_name_en', 100)->default('Khmer');
            $table->string('language_name_native', 100)->nullable();
            $table->string('format', 10)->default('vtt'); // vtt, srt
            $table->string('file_path');              // storage path (private)
            $table->unsignedInteger('file_size_bytes')->nullable();
            $table->string('checksum', 64)->nullable(); // SHA-256

            $table->enum('status', ['pending_review', 'approved', 'rejected'])->default('pending_review');
            $table->text('review_notes')->nullable();

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->boolean('is_default')->default(false);
            $table->unsignedSmallInteger('version')->default(1);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['episode_id', 'language_code', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subtitle_tracks');
    }
};
