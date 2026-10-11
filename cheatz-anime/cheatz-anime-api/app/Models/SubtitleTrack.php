<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubtitleTrack extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'episode_id',
        'language_code',
        'language_name_en',
        'language_name_native',
        'format',
        'file_path',
        'file_size_bytes',
        'checksum',
        'status',
        'review_notes',
        'uploaded_by',
        'reviewed_by',
        'reviewed_at',
        'is_default',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'is_default'  => 'boolean',
        ];
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForLanguage($query, string $lang)
    {
        return $query->where('language_code', $lang);
    }
}
