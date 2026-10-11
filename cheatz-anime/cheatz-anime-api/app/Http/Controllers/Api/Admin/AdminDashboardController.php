<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use App\Models\AuditLog;
use App\Models\Episode;
use App\Models\PaymentTransaction;
use App\Models\Season;
use App\Models\SubtitleTrack;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'users' => [
                'total'     => User::count(),
                'active'    => User::where('status', 'active')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
                'new_today' => User::whereDate('created_at', today())->count(),
            ],
            'subscriptions' => [
                'active'  => Subscription::where('status', 'active')->count(),
                'expired' => Subscription::where('status', 'expired')->count(),
                'cancelled' => Subscription::where('status', 'cancelled')->count(),
            ],
            'content' => [
                'anime_total'    => Anime::where('type', 'anime')->count(),
                'donghua_total'  => Anime::where('type', 'donghua')->count(),
                'published'      => Anime::where('status', 'published')->count(),
                'draft'          => Anime::where('status', 'draft')->count(),
                'seasons'        => Season::count(),
                'episodes'       => Episode::count(),
            ],
            'subtitles' => [
                'approved'       => SubtitleTrack::where('status', 'approved')->count(),
                'pending_review' => SubtitleTrack::where('status', 'pending_review')->count(),
                'rejected'       => SubtitleTrack::where('status', 'rejected')->count(),
            ],
            'payments' => [
                'completed_total'   => PaymentTransaction::where('status', 'completed')->count(),
                'revenue_cents_30d' => PaymentTransaction::where('status', 'completed')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->sum('amount_cents'),
                'pending'           => PaymentTransaction::where('status', 'pending')->count(),
            ],
            'recent_activity' => AuditLog::with('user')
                ->latest('created_at')
                ->limit(10)
                ->get()
                ->map(fn ($log) => [
                    'id'         => $log->id,
                    'action'     => $log->action,
                    'user'       => $log->user?->name,
                    'created_at' => $log->created_at,
                ]),
        ];

        return response()->json(['data' => $stats]);
    }
}
