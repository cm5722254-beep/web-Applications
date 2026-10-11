<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubtitleTrackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'episode_id'        => $this->episode_id,
            'language_code'     => $this->language_code,
            'language_name_en'  => $this->language_name_en,
            'language_name_native' => $this->language_name_native,
            'format'            => $this->format,
            'status'            => $this->status,
            'is_default'        => $this->is_default,
            'version'           => $this->version,
            // file_path is NEVER exposed to clients
            'uploaded_by'       => $this->whenLoaded('uploader', fn () => $this->uploader?->name),
            'reviewed_by'       => $this->whenLoaded('reviewer', fn () => $this->reviewer?->name),
            'reviewed_at'       => $this->reviewed_at,
            'review_notes'      => $this->when(
                $request->user()?->hasAnyRole(['super_admin', 'content_manager', 'subtitle_editor']),
                $this->review_notes
            ),
            'created_at'        => $this->created_at,
        ];
    }
}
