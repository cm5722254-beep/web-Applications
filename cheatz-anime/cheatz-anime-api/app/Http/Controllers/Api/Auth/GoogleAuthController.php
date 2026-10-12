<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class GoogleAuthController extends Controller
{
    public function callback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'     => ['required', 'email'],
            'name'      => ['required', 'string'],
            'avatar'    => ['nullable', 'string'],
            'google_id' => ['nullable', 'string'],
        ]);

        $email = strtolower(trim($validated['email']));
        
        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'   => $validated['name'],
                'avatar' => $validated['avatar'],
                'status' => 'active',
                'password' => Hash::make(uniqid('google_', true)),
            ]
        );

        // Update avatar and last login
        $user->update([
            'avatar' => $validated['avatar'] ?? $user->avatar,
        ]);

        // Assign super_admin role if email matches
        if ($email === 'socheatvireakchan@gmail.com' && !$user->hasRole('super_admin')) {
            $user->assignRole(['super_admin', 'admin', 'user']);
        } elseif (!$user->hasAnyRole(['super_admin', 'admin', 'user'])) {
            $user->assignRole('user');
        }

        // Generate API token
        $token = $user->createToken('google_auth')->plainTextToken;

        return response()->json([
            'user' => [
                'id'                          => $user->id,
                'name'                        => $user->name,
                'email'                       => $user->email,
                'avatar'                      => $user->avatar,
                'status'                      => $user->status,
                'roles'                       => $user->roles->pluck('name')->toArray(),
                'subscribed'                  => $user->isSubscribed(),
                'subscription_plan'           => $user->activeSubscription?->plan?->name,
                'subscription_expires_at'     => $user->activeSubscription?->ends_at,
                'preferred_language'          => $user->preferred_language ?? 'en',
                'preferred_subtitle_language' => $user->preferred_subtitle_language ?? 'en',
                'ads_enabled'                 => $user->ads_enabled ?? false,
                'email_verified_at'           => $user->email_verified_at,
                'created_at'                  => $user->created_at,
            ],
            'token' => $token,
        ]);
    }
}
