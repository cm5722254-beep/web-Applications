<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name_en'   => $this->name_en,
            'name_km'   => $this->name_km,
            'slug'      => $this->slug,
            'icon'      => $this->icon,
            'is_active' => $this->is_active,
        ];
    }
}
