<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnimeListResource;
use App\Models\Anime;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->with('anime.genres')
            ->latest()
            ->paginate(24);

        $animeList = $favorites->getCollection()->map(fn ($f) => $f->anime);

        return response()->json([
            'data' => AnimeListResource::collection($animeList),
            'meta' => [
                'current_page' => $favorites->currentPage(),
                'last_page'    => $favorites->lastPage(),
                'total'        => $favorites->total(),
            ],
        ]);
    }

    public function store(Request $request, int $animeId): JsonResponse
    {
        $anime = Anime::published()->findOrFail($animeId);

        Favorite::firstOrCreate([
            'user_id'  => $request->user()->id,
            'anime_id' => $anime->id,
        ]);

        // Increment count (cached)
        $anime->increment('favorites_count');

        return response()->json(['message' => 'Added to favorites.'], 201);
    }

    public function destroy(Request $request, int $animeId): JsonResponse
    {
        $deleted = Favorite::where('user_id', $request->user()->id)
            ->where('anime_id', $animeId)
            ->delete();

        if ($deleted) {
            Anime::where('id', $animeId)->decrement('favorites_count');
        }

        return response()->json(['message' => 'Removed from favorites.']);
    }
}
