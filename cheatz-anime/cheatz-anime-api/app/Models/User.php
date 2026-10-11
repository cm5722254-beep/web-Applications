<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'status',
        'preferred_language',
        'preferred_subtitle_language',
        'ads_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'           => 'datetime',
            'password'                    => 'hashed',
            'ads_enabled'                 => 'boolean',
        ];
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // ─── Relationships ────────────────────────────────────────────────────────────

    public function watchHistories(): HasMany
    {
        return $this->hasMany(WatchHistory::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest();
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    public function isSubscribed(): bool
    {
        return $this->activeSubscription()->exists();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }
}
