<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user')->latest('created_at');

        if ($request->action) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->from) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->to) {
            $query->where('created_at', '<=', $request->to);
        }

        $logs = $query->paginate(50);

        return response()->json([
            'data' => $logs->map(fn ($log) => [
                'id'         => $log->id,
                'action'     => $log->action,
                'user'       => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name] : null,
                'model_type' => $log->model_type,
                'model_id'   => $log->model_id,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at,
            ]),
            'meta' => ['total' => $logs->total(), 'current_page' => $logs->currentPage()],
        ]);
    }
}
