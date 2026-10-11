<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user()->load('roles'))]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                        => ['sometimes', 'string', 'min:2', 'max:100'],
            'preferred_language'          => ['sometimes', 'string', 'in:km,en'],
            'preferred_subtitle_language' => ['sometimes', 'string', 'max:10'],
        ]);

        $request->user()->update($validated);

        return response()->json(['data' => new UserResource($request->user()->fresh())]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'password'         => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $request->user()->update(['password' => $request->password]);

        // Revoke all other tokens
        $request->user()->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');

        $request->user()->update(['avatar' => $path]);

        return response()->json(['data' => new UserResource($request->user()->fresh())]);
    }
}
