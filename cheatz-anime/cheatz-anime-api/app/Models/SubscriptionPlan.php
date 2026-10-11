<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_km',
        'slug',
        'description_en',
        'description_km',
        'price_cents',
        'currency',
        'interval',
        'interval_count',
        'features',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'features'    => 'array',
            'is_active'   => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    /**
     * Returns price in major currency units (e.g. 1.00 for 100 cents USD).
     */
    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }
}
