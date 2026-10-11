<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Anime extends Model
{
    use HasFactory, HasSlug, SoftDeletes;

    protected $table = 'anime';

    protected $fillable = [
        'slug',
        'title_en',
        'title_km',
        'title_original',
        'alt_titles',
        'synopsis_en',
        'synopsis_km',
        'poster_url',
        'banner_url',
        'trailer_url',
        'type',
        'status',
        'airing_status',
        'age_rating',
        'country_of_origin',
        'language_original',
        'aired_from',
        'aired_to',
        'release_year',
        'is_premium',
        'source_provider',
        'source_id',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'alt_titles'      => 'array',
            'aired_from'      => 'date',
            'aired_to'        => 'date',
            'is_premium'      => 'boolean',
            'views_count'     => 'integer',
            'favorites_count' => 'integer',
            'average_score'   => 'float',
        ];
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title_en')
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate();
    }

    // ─── Relationships ────────────────────────────────────────────────────────────

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'anime_genre');
    }

    public function seasons(): HasMany
    {
        return $this->hasMany(Season::class)->orderBy('season_number');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function watchHistories(): HasMany
    {
        return $this->hasMany(WatchHistory::class);
    }

    public function contentLicenses(): HasMany
    {
        return $this->hasMany(ContentLicense::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        $like = '%' . mb_strtolower($term) . '%';

        return $query->where(function ($q) use ($like, $term) {
            $q->whereRaw('LOWER(title_en) LIKE ?', [$like])
              ->orWhereRaw('LOWER(title_km) LIKE ?', [$like])
              ->orWhereRaw('LOWER(title_original) LIKE ?', [$like])
              ->orWhereRaw("LOWER(alt_titles::text) LIKE ?", [$like]);
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    public function isLicensed(): bool
    {
        return $this->contentLicenses()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('license_end')->orWhere('license_end', '>=', now()->toDateString());
            })
            ->exists();
    }
}
