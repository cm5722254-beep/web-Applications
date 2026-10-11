<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnimeResource;
use App\Http\Resources\AnimeListResource;
use App\Models\Anime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimeController extends Controller
{
    /**
     * List anime with filtering, sorting, and pagination.
     * Max 100 per page for public endpoints.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'type'          => ['nullable', 'in:anime,donghua,movie,ova,ona,special'],
            'genre'         => ['nullable', 'string'],
            'year'          => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 2)],
            'country'       => ['nullable', 'string', 'size:2'],
            'airing_status' => ['nullable', 'in:ongoing,completed,upcoming,hiatus'],
            'age_rating'    => ['nullable', 'in:G,PG,PG-13,R,R+,Rx'],
            'sort'          => ['nullable', 'in:latest,oldest,title,views,score'],
            'per_page'      => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Anime::with(['genres'])
            ->published();

        if ($request->type) {
            $query->ofType($request->type);
        }

        if ($request->genre) {
            $query->whereHas('genres', fn ($q) => $q->where('slug', $request->genre));
        }

        if ($request->year) {
            $query->where('release_year', $request->year);
        }

        if ($request->country) {
            $query->where('country_of_origin', strtoupper($request->country));
        }

        if ($request->airing_status) {
            $query->where('airing_status', $request->airing_status);
        }

        if ($request->age_rating) {
            $query->where('age_rating', $request->age_rating);
        }

        match ($request->sort ?? 'latest') {
            'oldest' => $query->oldest(),
            'title'  => $query->orderBy('title_en'),
            'views'  => $query->orderByDesc('views_count'),
            'score'  => $query->orderByDesc('average_score'),
            default  => $query->latest(),
        };

        $perPage = min((int) ($request->per_page ?? 24), 100);
        $anime   = $query->paginate($perPage);

        return response()->json([
            'data'  => AnimeListResource::collection($anime),
            'meta'  => [
                'current_page' => $anime->currentPage(),
                'last_page'    => $anime->lastPage(),
                'per_page'     => $anime->perPage(),
                'total'        => $anime->total(),
            ],
        ]);
    }

    /**
     * Full-text search across titles.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q'        => ['required', 'string', 'min:1', 'max:200'],
            'type'     => ['nullable', 'in:anime,donghua,movie,ova,ona,special'],
            'genre'    => ['nullable', 'string'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Anime::with(['genres'])
            ->published()
            ->search($request->q);

        if ($request->type) {
            $query->ofType($request->type);
        }

        if ($request->genre) {
            $query->whereHas('genres', fn ($q) => $q->where('slug', $request->genre));
        }

        $perPage = min((int) ($request->per_page ?? 24), 100);
        $results = $query->paginate($perPage);

        return response()->json([
            'data'  => AnimeListResource::collection($results),
            'query' => $request->q,
            'meta'  => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
            ],
        ]);
    }

    /**
     * Get a single anime by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $anime = Anime::with(['genres', 'seasons' => fn ($q) => $q->published()])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => new AnimeResource($anime)]);
    }
}
