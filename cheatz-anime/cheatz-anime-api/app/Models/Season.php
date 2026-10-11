<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Season extends Model
{
    use HasFactory;

    protected $fillable = [
        'anime_id',
        'slug',
        'title_en',
        'title_km',
        'season_number',
        'synopsis_en',
        'synopsis_km',
        'poster_url',
        'status',
        'aired_from',
        'aired_to',
        'total_episodes',
    ];

    protected function casts(): array
    {
        return [
            'aired_from' => 'date',
            'aired_to'   => 'date',
        ];
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class)->orderBy('episode_number');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
