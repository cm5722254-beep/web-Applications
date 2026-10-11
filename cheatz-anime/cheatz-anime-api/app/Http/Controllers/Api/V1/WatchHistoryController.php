<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WatchHistoryResource;
use App\Models\Episode;
use App\Models\WatchHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchHistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $history = $request->user()
            ->watchHistories()
            ->with(['episode.season.anime', 'anime'])
            ->orderByDesc('last_watched_at')
            ->paginate(20);

        return response()->json([
            'data' => WatchHistoryResource::collection($history),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page'    => $history->lastPage(),
                'total'        => $history->total(),
            ],
        ]);
    }

    /**
     * Create or update a watch history entry.
     * Users can only update their own history.
     */
    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'episode_id'        => ['required', 'integer', 'exists:episodes,id'],
            'progress_seconds'  => ['required', 'integer', 'min:0'],
            'duration_seconds'  => ['nullable', 'integer', 'min:1'],
            'completed'         => ['nullable', 'boolean'],
            'subtitle_language' => ['nullable', 'string', 'max:10'],
        ]);

        $episode = Episode::published()->findOrFail($validated['episode_id']);

        $entry = WatchHistory::updateOrCreate(
            [
                'user_id'    => $request->user()->id,
                'episode_id' => $episode->id,
            ],
            [
                'anime_id'          => $episode->season->anime_id,
                'progress_seconds'  => $validated['progress_seconds'],
                'duration_seconds'  => $validated['duration_seconds'] ?? $entry['duration_seconds'] ?? null,
                'completed'         => $validated['completed'] ?? false,
                'subtitle_language' => $validated['subtitle_language'] ?? null,
                'last_watched_at'   => now(),
            ]
        );

        return response()->json(['data' => new WatchHistoryResource($entry)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $entry = WatchHistory::where('user_id', $request->user()->id)->findOrFail($id);
        $entry->delete();

        return response()->json(['message' => 'Watch history entry removed.']);
    }

    public function clearAll(Request $request): JsonResponse
    {
        $request->user()->watchHistories()->delete();

        return response()->json(['message' => 'Watch history cleared.']);
    }
}
