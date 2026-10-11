<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WatchHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'episode_id'        => $this->episode_id,
            'anime_id'          => $this->anime_id,
            'progress_seconds'  => $this->progress_seconds,
            'duration_seconds'  => $this->duration_seconds,
            'completed'         => $this->completed,
            'subtitle_language' => $this->subtitle_language,
            'last_watched_at'   => $this->last_watched_at,
            'episode'           => $this->whenLoaded('episode', fn () => [
                'id'            => $this->episode->id,
                'slug'          => $this->episode->slug,
                'title_en'      => $this->episode->title_en,
                'episode_number'=> $this->episode->episode_number,
                'thumbnail_url' => $this->episode->thumbnail_url,
                'anime'         => $this->episode->season?->anime ? [
                    'id'        => $this->episode->season->anime->id,
                    'slug'      => $this->episode->season->anime->slug,
                    'title_en'  => $this->episode->season->anime->title_en,
                    'title_km'  => $this->episode->season->anime->title_km,
                    'poster_url'=> $this->episode->season->anime->poster_url,
                ] : null,
            ]),
        ];
    }
}
