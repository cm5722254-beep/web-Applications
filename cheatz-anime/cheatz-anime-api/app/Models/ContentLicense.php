<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentLicense extends Model
{
    use HasFactory;

    protected $fillable = [
        'anime_id',
        'provider',
        'territory_code',
        'license_start',
        'license_end',
        'playback_type',
        'allowed_regions',
        'is_active',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'license_start'  => 'date',
            'license_end'    => 'date',
            'allowed_regions'=> 'array',
            'is_active'      => 'boolean',
        ];
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(Anime::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $today = now()->toDateString();

        if ($this->license_start && $this->license_start->gt(now())) {
            return false;
        }

        if ($this->license_end && $this->license_end->lt(now())) {
            return false;
        }

        return true;
    }
}
