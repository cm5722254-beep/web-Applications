<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimeListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'slug'           => $this->slug,
            'title_en'       => $this->title_en,
            'title_km'       => $this->title_km,
            'title_original' => $this->title_original,
            'poster_url'     => $this->poster_url,
            'type'           => $this->type,
            'airing_status'  => $this->airing_status,
            'release_year'   => $this->release_year,
            'views_count'    => $this->views_count,
            'average_score'  => $this->average_score,
            'is_premium'     => $this->is_premium,
            'genres'         => GenreResource::collection($this->whenLoaded('genres')),
        ];
    }
}
