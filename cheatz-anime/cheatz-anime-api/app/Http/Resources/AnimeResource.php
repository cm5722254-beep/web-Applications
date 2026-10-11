<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'slug'             => $this->slug,
            'title_en'         => $this->title_en,
            'title_km'         => $this->title_km,
            'title_original'   => $this->title_original,
            'alt_titles'       => $this->alt_titles,
            'synopsis_en'      => $this->synopsis_en,
            'synopsis_km'      => $this->synopsis_km,
            'poster_url'       => $this->poster_url,
            'banner_url'       => $this->banner_url,
            'trailer_url'      => $this->trailer_url,
            'type'             => $this->type,
            'status'           => $this->status,
            'airing_status'    => $this->airing_status,
            'age_rating'       => $this->age_rating,
            'country_of_origin'=> $this->country_of_origin,
            'release_year'     => $this->release_year,
            'aired_from'       => $this->aired_from?->toDateString(),
            'aired_to'         => $this->aired_to?->toDateString(),
            'views_count'      => $this->views_count,
            'favorites_count'  => $this->favorites_count,
            'average_score'    => $this->average_score,
            'is_premium'       => $this->is_premium,
            'genres'           => GenreResource::collection($this->whenLoaded('genres')),
            'seasons'          => SeasonResource::collection($this->whenLoaded('seasons')),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
