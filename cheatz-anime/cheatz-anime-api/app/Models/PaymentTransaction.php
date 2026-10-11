<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'subscription_id',
        'plan_id',
        'amount_cents',
        'currency',
        'status',
        'provider',
        'provider_order_id',
        'provider_payment_id',
        'provider_signature',
        'provider_response',
        'provider_event_at',
        'webhook_event_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'provider_response' => 'array',
            'provider_event_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function getAmountAttribute(): float
    {
        return $this->amount_cents / 100;
    }
}
