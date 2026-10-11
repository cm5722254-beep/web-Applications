<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'season_id'        => $this->season_id,
            'slug'             => $this->slug,
            'title_en'         => $this->title_en,
            'title_km'         => $this->title_km,
            'episode_number'   => $this->episode_number,
            'synopsis_en'      => $this->synopsis_en,
            'synopsis_km'      => $this->synopsis_km,
            'thumbnail_url'    => $this->thumbnail_url,
            'duration_seconds' => $this->duration_seconds,
            'has_hls'          => $this->has_hls,
            'status'           => $this->status,
            'is_premium'       => $this->is_premium,
            'aired_at'         => $this->aired_at?->toDateString(),
            // video_source_url is NEVER included here — use PlaybackController
        ];
    }
}
