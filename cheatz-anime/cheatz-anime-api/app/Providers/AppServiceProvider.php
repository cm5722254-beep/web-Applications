<?php

namespace App\Providers;

use App\Models\Anime;
use App\Policies\AnimePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Anime::class => AnimePolicy::class,
    ];

    public function register(): void
    {
        $this->app->singleton(\App\Services\AuditService::class);
        $this->app->singleton(\App\Services\PlaybackService::class);
        $this->app->singleton(\App\Services\PaymentService::class);
    }

    public function boot(): void
    {
        // Register policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        // Super admins bypass all gates
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('super_admin')) {
                return true;
            }
        });
    }
}
