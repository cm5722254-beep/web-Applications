<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Episode extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'season_id',
        'slug',
        'title_en',
        'title_km',
        'episode_number',
        'synopsis_en',
        'synopsis_km',
        'thumbnail_url',
        'video_source_provider',
        // video_source_url is excluded from mass assignment intentionally
        'duration_seconds',
        'has_hls',
        'status',
        'is_premium',
        'aired_at',
        'source_provider',
        'source_id',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'has_hls'    => 'boolean',
            'is_premium' => 'boolean',
            'aired_at'   => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────────

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    public function subtitleTracks(): HasMany
    {
        return $this->hasMany(SubtitleTrack::class);
    }

    public function watchHistories(): HasMany
    {
        return $this->hasMany(WatchHistory::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    /**
     * Never expose the raw video URL to clients.
     * Use PlaybackController to generate a signed, short-lived URL.
     */
    public function getVideoSourceUrl(): ?string
    {
        return $this->attributes['video_source_url'] ?? null;
    }

    public function setVideoSourceUrl(string $url): void
    {
        $this->attributes['video_source_url'] = $url;
    }
}
