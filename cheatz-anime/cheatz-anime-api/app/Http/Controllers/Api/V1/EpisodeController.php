<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EpisodeResource;
use App\Models\Anime;
use Illuminate\Http\JsonResponse;

class EpisodeController extends Controller
{
    public function index(string $animeSlug, string $seasonSlug): JsonResponse
    {
        $anime   = Anime::published()->where('slug', $animeSlug)->firstOrFail();
        $season  = $anime->seasons()->published()->where('slug', $seasonSlug)->firstOrFail();
        $episodes = $season->episodes()->published()->get();

        return response()->json(['data' => EpisodeResource::collection($episodes)]);
    }

    public function show(string $animeSlug, string $seasonSlug, string $episodeSlug): JsonResponse
    {
        $anime   = Anime::published()->where('slug', $animeSlug)->firstOrFail();
        $season  = $anime->seasons()->published()->where('slug', $seasonSlug)->firstOrFail();
        $episode = $season->episodes()
            ->published()
            ->where('slug', $episodeSlug)
            ->firstOrFail();

        return response()->json(['data' => new EpisodeResource($episode)]);
    }
}
