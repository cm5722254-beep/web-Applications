<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create super admin ONLY if no super_admin exists yet
        if (User::role('super_admin')->exists()) {
            $this->command->info('Super admin already exists. Skipping.');
            return;
        }

        $email    = env('ADMIN_EMAIL', 'admin@cheatz.anime');
        $password = env('ADMIN_PASSWORD');

        if (empty($password)) {
            $this->command->error(
                'ADMIN_PASSWORD is not set in .env. ' .
                'Set ADMIN_EMAIL and ADMIN_PASSWORD before running this seeder.'
            );
            return;
        }

        $admin = User::create([
            'name'     => 'CHEATZ Admin',
            'email'    => $email,
            'password' => Hash::make($password),
            'status'   => 'active',
        ]);

        $admin->assignRole('super_admin');

        $this->command->info("Super admin created: {$email}");
        $this->command->warn('Change the admin password immediately after first login.');
    }
}
