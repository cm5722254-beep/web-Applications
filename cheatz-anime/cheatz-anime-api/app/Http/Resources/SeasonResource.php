<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeasonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'anime_id'       => $this->anime_id,
            'slug'           => $this->slug,
            'title_en'       => $this->title_en,
            'title_km'       => $this->title_km,
            'season_number'  => $this->season_number,
            'synopsis_en'    => $this->synopsis_en,
            'synopsis_km'    => $this->synopsis_km,
            'poster_url'     => $this->poster_url,
            'status'         => $this->status,
            'aired_from'     => $this->aired_from?->toDateString(),
            'aired_to'       => $this->aired_to?->toDateString(),
            'total_episodes' => $this->total_episodes,
            'episodes'       => EpisodeResource::collection($this->whenLoaded('episodes')),
        ];
    }
}
