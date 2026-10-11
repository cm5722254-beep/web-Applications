<?php

namespace Tests\Feature;

use App\Models\Anime;
use App\Models\Genre;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnimeApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_public_catalog_returns_only_published_anime(): void
    {
        Anime::factory()->count(3)->create(['status' => 'published']);
        Anime::factory()->count(2)->create(['status' => 'draft']);

        $response = $this->getJson('/api/v1/anime');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_catalog_filters_by_type(): void
    {
        Anime::factory()->count(2)->create(['status' => 'published', 'type' => 'anime']);
        Anime::factory()->count(3)->create(['status' => 'published', 'type' => 'donghua']);

        $response = $this->getJson('/api/v1/anime?type=donghua');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_catalog_filters_by_genre(): void
    {
        $genre = Genre::factory()->create(['slug' => 'action']);
        $anime = Anime::factory()->count(2)->create(['status' => 'published']);
        $other = Anime::factory()->count(3)->create(['status' => 'published']);

        foreach ($anime as $a) {
            $a->genres()->attach($genre);
        }

        $response = $this->getJson('/api/v1/anime?genre=action');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_search_returns_matching_anime(): void
    {
        Anime::factory()->create(['status' => 'published', 'title_en' => 'Naruto Shippuden']);
        Anime::factory()->create(['status' => 'published', 'title_en' => 'One Piece']);
        Anime::factory()->create(['status' => 'published', 'title_en' => 'Dragon Ball Z']);

        $response = $this->getJson('/api/v1/search?q=naruto');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Naruto Shippuden', $response->json('data.0.title_en'));
    }

    public function test_search_requires_query_parameter(): void
    {
        $this->getJson('/api/v1/search')->assertStatus(422);
    }

    public function test_get_anime_by_slug(): void
    {
        $anime = Anime::factory()->create(['status' => 'published', 'slug' => 'test-anime']);

        $response = $this->getJson('/api/v1/anime/test-anime');

        $response->assertStatus(200)->assertJsonFragment(['slug' => 'test-anime']);
    }

    public function test_draft_anime_not_accessible_publicly(): void
    {
        Anime::factory()->create(['status' => 'draft', 'slug' => 'hidden-anime']);

        $this->getJson('/api/v1/anime/hidden-anime')->assertStatus(404);
    }

    public function test_pagination_respects_per_page_cap(): void
    {
        Anime::factory()->count(5)->create(['status' => 'published']);

        $response = $this->getJson('/api/v1/anime?per_page=200');

        $response->assertStatus(200);
        // Should be capped at 100 max
        $this->assertLessThanOrEqual(100, $response->json('meta.per_page'));
    }

    public function test_admin_can_access_draft_anime(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        $token = $admin->createToken('test')->plainTextToken;

        Anime::factory()->create(['status' => 'draft', 'slug' => 'my-draft']);

        // Admin can see it via admin endpoint
        $response = $this->withToken($token)->getJson('/api/v1/admin/anime?status=draft');
        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_regular_user_cannot_access_admin_endpoints(): void
    {
        $user  = User::factory()->create();
        $user->assignRole('user');
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/admin/anime')->assertStatus(403);
    }
}
