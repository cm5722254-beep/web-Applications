<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeasonResource;
use App\Models\Anime;
use Illuminate\Http\JsonResponse;

class SeasonController extends Controller
{
    public function index(string $animeSlug): JsonResponse
    {
        $anime   = Anime::published()->where('slug', $animeSlug)->firstOrFail();
        $seasons = $anime->seasons()->published()->with('anime')->get();

        return response()->json(['data' => SeasonResource::collection($seasons)]);
    }

    public function show(string $animeSlug, string $seasonSlug): JsonResponse
    {
        $anime  = Anime::published()->where('slug', $animeSlug)->firstOrFail();
        $season = $anime->seasons()
            ->published()
            ->where('slug', $seasonSlug)
            ->firstOrFail();

        return response()->json(['data' => new SeasonResource($season)]);
    }
}
