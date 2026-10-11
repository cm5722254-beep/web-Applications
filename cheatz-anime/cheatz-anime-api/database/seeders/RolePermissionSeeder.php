<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // Anime
            'anime.view', 'anime.create', 'anime.update', 'anime.delete', 'anime.publish',
            // Genres
            'genre.create', 'genre.update', 'genre.delete',
            // Seasons & Episodes
            'season.create', 'season.update', 'season.delete',
            'episode.create', 'episode.update', 'episode.delete',
            'episode.set_video_source',
            // Subtitles
            'subtitle.upload', 'subtitle.review', 'subtitle.approve', 'subtitle.delete',
            // Users
            'user.view', 'user.update', 'user.suspend', 'user.role_manage',
            // Subscriptions
            'subscription.view', 'subscription.cancel',
            // Audit
            'audit.view',
            // Dashboard
            'dashboard.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        // super_admin: all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'sanctum']);
        $superAdmin->syncPermissions($permissions);

        // content_manager
        $contentManager = Role::firstOrCreate(['name' => 'content_manager', 'guard_name' => 'sanctum']);
        $contentManager->syncPermissions([
            'anime.view', 'anime.create', 'anime.update', 'anime.publish',
            'genre.create', 'genre.update',
            'season.create', 'season.update',
            'episode.create', 'episode.update', 'episode.set_video_source',
            'subtitle.upload', 'subtitle.review', 'subtitle.approve',
            'user.view',
            'subscription.view',
            'audit.view',
            'dashboard.view',
        ]);

        // subtitle_editor
        $subtitleEditor = Role::firstOrCreate(['name' => 'subtitle_editor', 'guard_name' => 'sanctum']);
        $subtitleEditor->syncPermissions([
            'subtitle.upload', 'subtitle.review', 'subtitle.approve',
            'anime.view',
            'dashboard.view',
        ]);

        // support_agent
        $support = Role::firstOrCreate(['name' => 'support_agent', 'guard_name' => 'sanctum']);
        $support->syncPermissions([
            'user.view', 'user.update', 'user.suspend',
            'subscription.view',
            'audit.view',
            'dashboard.view',
        ]);

        // user (regular)
        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'sanctum']);

        $this->command->info('Roles and permissions seeded.');
    }
}
