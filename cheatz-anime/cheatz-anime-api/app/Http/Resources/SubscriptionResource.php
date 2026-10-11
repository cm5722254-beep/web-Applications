<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status,
            'starts_at'    => $this->starts_at,
            'ends_at'      => $this->ends_at,
            'cancelled_at' => $this->cancelled_at,
            'provider'     => $this->provider,
            'plan'         => $this->whenLoaded('plan', fn () => new SubscriptionPlanResource($this->plan)),
            'user'         => $this->whenLoaded('user', fn () => ['id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email]),
            'created_at'   => $this->created_at,
        ];
    }
}
