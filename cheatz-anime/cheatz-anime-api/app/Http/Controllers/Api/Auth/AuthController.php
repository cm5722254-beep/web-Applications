<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private AuditService $audit) {}

    /**
     * Register a new regular user account.
     * Never grants privileged roles.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
        ]);

        $user->assignRole('user');

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->audit->log('user.registered', $user, null, null, $request);

        return response()->json([
            'message' => 'Registration successful.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Login and issue a Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is ' . $user->status . '. Please contact support.',
            ], 403);
        }

        // Revoke previous tokens from the same device name if sent
        $deviceName = $request->header('X-Device-Name', 'web');
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        $this->audit->log('user.login', $user, null, null, $request);

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Revoke the current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        $this->audit->log('user.logout', $request->user(), null, null, $request);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()->load('roles')));
    }
}
