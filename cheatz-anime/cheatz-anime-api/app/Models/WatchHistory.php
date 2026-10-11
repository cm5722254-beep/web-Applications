<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WatchHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'episode_id',
        'anime_id',
        'progress_seconds',
        'duration_seconds',
        'completed',
        'subtitle_language',
        'last_watched_at',
    ];

    protected function casts(): array
    {
        return [
            'completed'       => 'boolean',
            'last_watched_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }
}
