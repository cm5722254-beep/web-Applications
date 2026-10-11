<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeasonResource;
use App\Models\Anime;
use App\Models\Season;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSeasonController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Season::with('anime')->latest();
        if ($request->anime_id) {
            $query->where('anime_id', $request->anime_id);
        }
        $seasons = $query->paginate(20);

        return response()->json([
            'data' => SeasonResource::collection($seasons),
            'meta' => ['total' => $seasons->total()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $season = Season::with('anime', 'episodes')->findOrFail($id);
        return response()->json(['data' => new SeasonResource($season)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'anime_id'       => ['required', 'integer', 'exists:anime,id'],
            'title_en'       => ['nullable', 'string', 'max:500'],
            'title_km'       => ['nullable', 'string', 'max:500'],
            'season_number'  => ['required', 'integer', 'min:1'],
            'synopsis_en'    => ['nullable', 'string'],
            'poster_url'     => ['nullable', 'url', 'max:2000'],
            'status'         => ['nullable', 'in:draft,published,unlisted'],
            'aired_from'     => ['nullable', 'date'],
            'aired_to'       => ['nullable', 'date'],
            'total_episodes' => ['nullable', 'integer', 'min:1'],
        ]);

        $anime  = Anime::findOrFail($validated['anime_id']);
        $slug   = 'season-' . $validated['season_number'];
        $season = Season::create(array_merge($validated, ['slug' => $slug]));
        $this->audit->log('season.created', $request->user(), $season, null, $request);

        return response()->json(['data' => new SeasonResource($season)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $season    = Season::findOrFail($id);
        $validated = $request->validate([
            'title_en'       => ['nullable', 'string', 'max:500'],
            'title_km'       => ['nullable', 'string', 'max:500'],
            'synopsis_en'    => ['nullable', 'string'],
            'poster_url'     => ['nullable', 'url', 'max:2000'],
            'status'         => ['nullable', 'in:draft,published,unlisted'],
            'aired_from'     => ['nullable', 'date'],
            'aired_to'       => ['nullable', 'date'],
            'total_episodes' => ['nullable', 'integer'],
        ]);
        $season->update($validated);
        $this->audit->log('season.updated', $request->user(), $season, null, $request);

        return response()->json(['data' => new SeasonResource($season)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $season = Season::findOrFail($id);
        $this->audit->log('season.deleted', $request->user(), $season, $season->toArray(), $request);
        $season->delete();

        return response()->json(['message' => 'Season deleted.']);
    }
}
