<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditService
{
    public function log(
        string  $action,
        ?User   $user = null,
        ?Model  $model = null,
        ?array  $oldValues = null,
        ?Request $request = null,
        ?array  $newValues = null
    ): AuditLog {
        return AuditLog::create([
            'user_id'    => $user?->id,
            'action'     => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id'   => $model?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
