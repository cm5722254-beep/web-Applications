<?php

namespace App\Policies;

use App\Models\Anime;
use App\Models\User;

class AnimePolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public catalog
    }

    public function view(?User $user, Anime $anime): bool
    {
        if ($anime->status === 'published') {
            return true;
        }

        return $user?->hasAnyRole(['super_admin', 'content_manager']) ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'content_manager']);
    }

    public function update(User $user, Anime $anime): bool
    {
        return $user->hasAnyRole(['super_admin', 'content_manager']);
    }

    public function delete(User $user, Anime $anime): bool
    {
        return $user->hasRole('super_admin');
    }

    public function publish(User $user, Anime $anime): bool
    {
        return $user->hasAnyRole(['super_admin', 'content_manager']);
    }
}
