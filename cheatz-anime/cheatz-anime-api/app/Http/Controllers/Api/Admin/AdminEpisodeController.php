<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EpisodeResource;
use App\Models\Episode;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminEpisodeController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Episode::with('season.anime')->latest();

        if ($request->season_id) {
            $query->where('season_id', $request->season_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $episodes = $query->paginate(20);

        return response()->json([
            'data' => EpisodeResource::collection($episodes),
            'meta' => ['total' => $episodes->total(), 'current_page' => $episodes->currentPage()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $episode = Episode::with('season.anime')->findOrFail($id);

        return response()->json(['data' => new EpisodeResource($episode)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'season_id'       => ['required', 'integer', 'exists:seasons,id'],
            'title_en'        => ['nullable', 'string', 'max:500'],
            'title_km'        => ['nullable', 'string', 'max:500'],
            'episode_number'  => ['required', 'integer', 'min:1'],
            'synopsis_en'     => ['nullable', 'string'],
            'thumbnail_url'   => ['nullable', 'url', 'max:2000'],
            'duration_seconds'=> ['nullable', 'integer', 'min:1'],
            'status'          => ['nullable', 'in:draft,published,unlisted'],
            'is_premium'      => ['boolean'],
            'aired_at'        => ['nullable', 'date'],
        ]);

        $validated['slug']       = 'episode-' . $validated['episode_number'];
        $validated['created_by'] = $request->user()->id;

        $episode = Episode::create($validated);
        $this->audit->log('episode.created', $request->user(), $episode, null, $request);

        return response()->json(['data' => new EpisodeResource($episode)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $episode   = Episode::findOrFail($id);
        $validated = $request->validate([
            'title_en'        => ['nullable', 'string', 'max:500'],
            'title_km'        => ['nullable', 'string', 'max:500'],
            'synopsis_en'     => ['nullable', 'string'],
            'thumbnail_url'   => ['nullable', 'url', 'max:2000'],
            'duration_seconds'=> ['nullable', 'integer'],
            'status'          => ['nullable', 'in:draft,published,unlisted'],
            'is_premium'      => ['boolean'],
            'aired_at'        => ['nullable', 'date'],
        ]);
        $validated['updated_by'] = $request->user()->id;
        $episode->update($validated);
        $this->audit->log('episode.updated', $request->user(), $episode, null, $request);

        return response()->json(['data' => new EpisodeResource($episode)]);
    }

    /**
     * Update video source. Only privileged roles can set the actual video URL.
     */
    public function updateVideoSource(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasAnyRole(['super_admin', 'content_manager'])) {
            return response()->json(['message' => 'Insufficient permissions to update video sources.'], 403);
        }

        $request->validate([
            'video_source_url'      => ['required', 'url', 'max:2000'],
            'video_source_provider' => ['required', 'string', 'max:100'],
            'has_hls'               => ['boolean'],
        ]);

        $episode = Episode::findOrFail($id);
        $episode->setVideoSourceUrl($request->video_source_url);
        $episode->video_source_provider = $request->video_source_provider;
        $episode->has_hls = $request->boolean('has_hls', false);
        $episode->updated_by = $request->user()->id;
        $episode->save();

        $this->audit->log('episode.video_updated', $request->user(), $episode, null, $request);

        return response()->json(['message' => 'Video source updated.']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $episode = Episode::findOrFail($id);
        $this->audit->log('episode.deleted', $request->user(), $episode, $episode->toArray(), $request);
        $episode->delete();

        return response()->json(['message' => 'Episode deleted.']);
    }
}
