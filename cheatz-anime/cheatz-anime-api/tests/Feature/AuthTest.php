<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    // ── Registration ─────────────────────────────────────────────────────────

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token', 'message']);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_registration_creates_regular_user_not_admin(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue($user->hasRole('user'));
        $this->assertFalse($user->hasRole('super_admin'));
        $this->assertFalse($user->hasRole('content_manager'));
    }

    public function test_registration_requires_strong_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrorFor('password');
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Other User',
            'email'                 => 'taken@example.com',
            'password'              => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrorFor('email');
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => bcrypt('SecurePass123')]);
        $user->assignRole('user');

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'SecurePass123',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('SecurePass123')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401)->assertJson(['message' => 'Invalid credentials.']);
    }

    public function test_suspended_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('SecurePass123'),
            'status'   => 'suspended',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'SecurePass123',
        ]);

        $response->assertStatus(403);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_logout(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    // ── Protected routes ──────────────────────────────────────────────────────

    public function test_unauthenticated_access_to_protected_route_returns_401(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_authenticated_user_can_get_own_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/auth/me');

        $response->assertStatus(200)->assertJsonFragment(['email' => $user->email]);
    }
}
