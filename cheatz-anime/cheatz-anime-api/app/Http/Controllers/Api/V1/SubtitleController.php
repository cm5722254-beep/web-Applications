<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubtitleTrackResource;
use App\Models\Episode;
use App\Models\SubtitleTrack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubtitleController extends Controller
{
    /**
     * List approved subtitle tracks for an episode.
     */
    public function index(Request $request, int $episodeId): JsonResponse
    {
        $episode = Episode::published()->findOrFail($episodeId);

        $tracks = $episode->subtitleTracks()
            ->approved()
            ->get();

        return response()->json(['data' => SubtitleTrackResource::collection($tracks)]);
    }

    /**
     * Stream an approved subtitle file to an authorized user.
     * Validates an HMAC token to prevent unauthorized access.
     */
    public function stream(Request $request, int $id): \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $track = SubtitleTrack::approved()->findOrFail($id);
        $user  = $request->user();

        // Validate HMAC token
        $token    = $request->query('token');
        $parts    = explode('.', $token ?? '');

        if (count($parts) !== 3) {
            return response()->json(['message' => 'Invalid subtitle token.'], 403);
        }

        [$subtitleId, $userId, $expiry] = $parts;

        if ((int) $userId !== $user->id || (int) $subtitleId !== $id) {
            return response()->json(['message' => 'Subtitle token mismatch.'], 403);
        }

        if ((int) $expiry < now()->timestamp) {
            return response()->json(['message' => 'Subtitle token expired.'], 403);
        }

        $expected = hash_hmac('sha256', $id . '.' . $user->id . '.' . $expiry, config('app.key'));
        if (! hash_equals($expected, $token)) {
            return response()->json(['message' => 'Subtitle token invalid.'], 403);
        }

        $disk = Storage::disk(config('filesystems.disks.subtitles') ? 'subtitles' : 'local');

        if (! $disk->exists($track->file_path)) {
            return response()->json(['message' => 'Subtitle file not found.'], 404);
        }

        return $disk->response($track->file_path, null, [
            'Content-Type'  => 'text/vtt; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }
}
