<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                          => $this->id,
            'name'                        => $this->name,
            'email'                       => $this->email,
            'avatar'                      => $this->avatar,
            'status'                      => $this->status,
            'preferred_language'          => $this->preferred_language,
            'preferred_subtitle_language' => $this->preferred_subtitle_language,
            'ads_enabled'                 => $this->ads_enabled,
            'email_verified_at'           => $this->email_verified_at,
            'roles'                       => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')),
            'subscribed'                  => $this->when($request->routeIs('auth.me', 'user.*'), fn () => $this->isSubscribed()),
            'created_at'                  => $this->created_at,
        ];
    }
}
