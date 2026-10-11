<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name_en'        => $this->name_en,
            'name_km'        => $this->name_km,
            'slug'           => $this->slug,
            'description_en' => $this->description_en,
            'description_km' => $this->description_km,
            'price_cents'    => $this->price_cents,
            'price'          => $this->price,
            'currency'       => $this->currency,
            'interval'       => $this->interval,
            'interval_count' => $this->interval_count,
            'features'       => $this->features ?? [],
            'is_featured'    => $this->is_featured,
        ];
    }
}
