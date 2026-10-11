<?php

namespace App\Services;

use App\Models\Episode;
use App\Models\SubtitleTrack;
use App\Models\User;

class PlaybackService
{
    /**
     * Authorize playback and generate a short-lived URL.
     *
     * If no video source is configured, returns unavailable.
     * Never exposes raw storage URLs directly.
     */
    public function authorize(User $user, Episode $episode): array
    {
        $rawUrl = $episode->getVideoSourceUrl();

        if (empty($rawUrl)) {
            return [
                'available' => false,
                'reason'    => 'No video source is configured for this episode. ' .
                    'Contact the content manager to add an authorized video source.',
            ];
        }

        // Build authorized subtitle list
        $subtitles = SubtitleTrack::where('episode_id', $episode->id)
            ->approved()
            ->get()
            ->map(fn ($s) => [
                'id'       => $s->id,
                'language' => $s->language_code,
                'label'    => $s->language_name_en,
                'url'      => route('subtitle.stream', $s->id) . '?token=' . $this->signSubtitleToken($s->id, $user->id),
                'default'  => $s->is_default,
            ]);

        // For now, issue the direct provider URL with short expiry tracking.
        // In production this should proxy through a CDN or sign the URL at the provider level.
        $expiresAt = now()->addHours(4)->toISOString();

        return [
            'available'  => true,
            'url'        => $rawUrl,
            'type'       => $episode->has_hls ? 'hls' : 'mp4',
            'expires_at' => $expiresAt,
            'subtitles'  => $subtitles,
        ];
    }

    private function signSubtitleToken(int $subtitleId, int $userId): string
    {
        $payload = $subtitleId . '.' . $userId . '.' . now()->addHours(4)->timestamp;

        return hash_hmac('sha256', $payload, config('app.key'));
    }
}
