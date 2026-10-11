<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnimeResource;
use App\Models\Anime;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAnimeController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', 'in:draft,published,unlisted'],
            'type'   => ['nullable', 'in:anime,donghua,movie,ova,ona,special'],
            'search' => ['nullable', 'string', 'max:200'],
        ]);

        $query = Anime::with('genres')->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->type) {
            $query->ofType($request->type);
        }
        if ($request->search) {
            $query->search($request->search);
        }

        $anime = $query->paginate(20);

        return response()->json([
            'data' => AnimeResource::collection($anime),
            'meta' => ['current_page' => $anime->currentPage(), 'last_page' => $anime->lastPage(), 'total' => $anime->total()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $anime = Anime::with(['genres', 'seasons.episodes', 'contentLicenses'])->findOrFail($id);

        return response()->json(['data' => new AnimeResource($anime)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Anime::class);

        $validated = $this->validated($request);
        $validated['created_by'] = $request->user()->id;

        $anime = Anime::create($validated);

        if ($request->has('genre_ids')) {
            $anime->genres()->sync($request->genre_ids);
        }

        $this->audit->log('anime.created', $request->user(), $anime, null, $request, $validated);

        return response()->json(['data' => new AnimeResource($anime->load('genres'))], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $anime = Anime::findOrFail($id);
        $this->authorize('update', $anime);

        $validated = $this->validated($request, $id);
        $validated['updated_by'] = $request->user()->id;

        $old = $anime->toArray();
        $anime->update($validated);

        if ($request->has('genre_ids')) {
            $anime->genres()->sync($request->genre_ids);
        }

        $this->audit->log('anime.updated', $request->user(), $anime, $old, $request, $validated);

        return response()->json(['data' => new AnimeResource($anime->load('genres'))]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $anime = Anime::findOrFail($id);
        $this->authorize('delete', $anime);

        $this->audit->log('anime.deleted', $request->user(), $anime, $anime->toArray(), $request);

        $anime->delete();

        return response()->json(['message' => 'Anime deleted.']);
    }

    public function publish(Request $request, int $id): JsonResponse
    {
        $anime = Anime::findOrFail($id);
        $this->authorize('update', $anime);
        $anime->update(['status' => 'published', 'updated_by' => $request->user()->id]);
        $this->audit->log('anime.published', $request->user(), $anime, null, $request);

        return response()->json(['message' => 'Anime published.']);
    }

    public function unpublish(Request $request, int $id): JsonResponse
    {
        $anime = Anime::findOrFail($id);
        $this->authorize('update', $anime);
        $anime->update(['status' => 'draft', 'updated_by' => $request->user()->id]);
        $this->audit->log('anime.unpublished', $request->user(), $anime, null, $request);

        return response()->json(['message' => 'Anime set to draft.']);
    }

    public function syncGenres(Request $request, int $id): JsonResponse
    {
        $request->validate(['genre_ids' => ['required', 'array'], 'genre_ids.*' => ['integer', 'exists:genres,id']]);
        $anime = Anime::findOrFail($id);
        $this->authorize('update', $anime);
        $anime->genres()->sync($request->genre_ids);

        return response()->json(['message' => 'Genres updated.']);
    }

    private function validated(Request $request, ?int $excludeId = null): array
    {
        return $request->validate([
            'title_en'         => ['required', 'string', 'max:500'],
            'title_km'         => ['nullable', 'string', 'max:500'],
            'title_original'   => ['nullable', 'string', 'max:500'],
            'synopsis_en'      => ['nullable', 'string'],
            'synopsis_km'      => ['nullable', 'string'],
            'poster_url'       => ['nullable', 'url', 'max:2000'],
            'banner_url'       => ['nullable', 'url', 'max:2000'],
            'trailer_url'      => ['nullable', 'url', 'max:2000'],
            'type'             => ['required', 'in:anime,donghua,movie,ova,ona,special'],
            'airing_status'    => ['nullable', 'in:ongoing,completed,upcoming,hiatus'],
            'age_rating'       => ['nullable', 'in:G,PG,PG-13,R,R+,Rx'],
            'country_of_origin'=> ['nullable', 'string', 'max:5'],
            'aired_from'       => ['nullable', 'date'],
            'aired_to'         => ['nullable', 'date'],
            'release_year'     => ['nullable', 'integer', 'min:1900'],
            'is_premium'       => ['boolean'],
        ]);
    }
}
