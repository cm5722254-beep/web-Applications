<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anime', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title_en');
            $table->string('title_km')->nullable();          // Khmer title
            $table->string('title_original')->nullable();    // Japanese/Chinese original
            $table->text('alt_titles')->nullable();          // JSON array of alternative titles
            $table->text('synopsis_en')->nullable();
            $table->text('synopsis_km')->nullable();
            $table->string('poster_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('trailer_url')->nullable();

            // Classification
            $table->enum('type', ['anime', 'donghua', 'movie', 'ova', 'ona', 'special'])->default('anime');
            $table->enum('status', ['draft', 'published', 'unlisted'])->default('draft');
            $table->enum('airing_status', ['ongoing', 'completed', 'upcoming', 'hiatus'])->default('upcoming');
            $table->enum('age_rating', ['G', 'PG', 'PG-13', 'R', 'R+', 'Rx'])->default('PG-13');
            $table->string('country_of_origin', 5)->default('JP'); // JP, CN, KR, etc.
            $table->string('language_original', 10)->default('ja');

            // Dates
            $table->date('aired_from')->nullable();
            $table->date('aired_to')->nullable();
            $table->smallInteger('release_year')->nullable();

            // Stats (cached, updated by job)
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('favorites_count')->default(0);
            $table->decimal('average_score', 4, 2)->nullable();

            // Premium
            $table->boolean('is_premium')->default(false);

            // Content source tracking
            $table->string('source_provider')->nullable(); // e.g. 'animekill', 'manual'
            $table->string('source_id')->nullable();       // provider's internal ID

            // Creator tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('status');
            $table->index('airing_status');
            $table->index('release_year');
            $table->index('country_of_origin');
            $table->index('is_premium');
        });

        // Anime <-> Genre pivot
        Schema::create('anime_genre', function (Blueprint $table) {
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete();
            $table->foreignId('genre_id')->constrained()->cascadeOnDelete();
            $table->primary(['anime_id', 'genre_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anime_genre');
        Schema::dropIfExists('anime');
    }
};
