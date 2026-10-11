<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use App\Services\PlaybackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaybackController extends Controller
{
    public function __construct(private PlaybackService $playback) {}

    /**
     * Validate playback permissions and return a short-lived authorized URL.
     * Never exposes raw storage credentials or permanent media URLs.
     */
    public function getPlaybackUrl(Request $request, int $episodeId): JsonResponse
    {
        $episode = Episode::with('season.anime')->published()->findOrFail($episodeId);
        $user    = $request->user();

        // Premium content requires active subscription
        if ($episode->is_premium && ! $user->isSubscribed()) {
            return response()->json([
                'message'  => 'This episode requires an active subscription.',
                'requires' => 'subscription',
            ], 403);
        }

        // Validate content license
        if (! $episode->season->anime->isLicensed()) {
            return response()->json([
                'message' => 'This content is not currently available in your region or is unlicensed.',
            ], 403);
        }

        $result = $this->playback->authorize($user, $episode);

        if (! $result['available']) {
            return response()->json([
                'message' => $result['reason'] ?? 'Playback is unavailable.',
            ], 503);
        }

        return response()->json([
            'playback_url' => $result['url'],
            'expires_at'   => $result['expires_at'],
            'subtitles'    => $result['subtitles'],
            'type'         => $result['type'], // 'hls' | 'mp4'
        ]);
    }
}
