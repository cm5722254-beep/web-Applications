<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\AnimeController;
use App\Http\Controllers\Api\V1\EpisodeController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\GenreController;
use App\Http\Controllers\Api\V1\PlaybackController;
use App\Http\Controllers\Api\V1\SeasonController;
use App\Http\Controllers\Api\V1\SubtitleController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WatchHistoryController;
use App\Http\Controllers\Api\Admin\AdminAnimeController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminEpisodeController;
use App\Http\Controllers\Api\Admin\AdminGenreController;
use App\Http\Controllers\Api\Admin\AdminSeasonController;
use App\Http\Controllers\Api\Admin\AdminSubtitleController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Payment\RazorpayController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public ──────────────────────────────────────────────────────────────────

Route::prefix('v1')->group(function () {

    // ── Authentication ────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])
            ->middleware('throttle:10,1');
        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:10,1');
        Route::post('forgot-password', [PasswordResetController::class, 'sendLink'])
            ->middleware('throttle:5,1');
        Route::post('reset-password', [PasswordResetController::class, 'reset'])
            ->middleware('throttle:5,1');
    });

    // ── Public Catalog ────────────────────────────────────────────────────────
    Route::get('anime', [AnimeController::class, 'index']);
    Route::get('anime/{slug}', [AnimeController::class, 'show']);
    Route::get('anime/{slug}/seasons', [SeasonController::class, 'index']);
    Route::get('anime/{animeSlug}/seasons/{seasonSlug}', [SeasonController::class, 'show']);
    Route::get('anime/{animeSlug}/seasons/{seasonSlug}/episodes', [EpisodeController::class, 'index']);
    Route::get('anime/{animeSlug}/seasons/{seasonSlug}/episodes/{episodeSlug}', [EpisodeController::class, 'show']);

    Route::get('genres', [GenreController::class, 'index']);
    Route::get('genres/{slug}', [GenreController::class, 'show']);

    Route::get('search', [AnimeController::class, 'search']);

    // ── Subscription Plans (public listing) ──────────────────────────────────
    Route::get('plans', [SubscriptionController::class, 'plans']);

    // ── Razorpay Webhook (no auth — verified by signature) ───────────────────
    Route::post('webhooks/razorpay', [RazorpayController::class, 'webhook'])
        ->middleware('throttle:100,1');
});

// ─── Authenticated ────────────────────────────────────────────────────────────

Route::prefix('v1')->middleware(['auth:sanctum', 'account.active'])->group(function () {

    // ── Auth management ───────────────────────────────────────────────────────
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // ── User profile ──────────────────────────────────────────────────────────
    Route::get('user/profile', [UserController::class, 'show']);
    Route::put('user/profile', [UserController::class, 'update']);
    Route::post('user/avatar', [UserController::class, 'updateAvatar']);
    Route::put('user/password', [UserController::class, 'updatePassword']);

    // ── Watch history ─────────────────────────────────────────────────────────
    Route::get('user/history', [WatchHistoryController::class, 'index']);
    Route::post('user/history', [WatchHistoryController::class, 'upsert']);
    Route::delete('user/history/{id}', [WatchHistoryController::class, 'destroy']);
    Route::delete('user/history', [WatchHistoryController::class, 'clearAll']);

    // ── Favorites ─────────────────────────────────────────────────────────────
    Route::get('user/favorites', [FavoriteController::class, 'index']);
    Route::post('user/favorites/{animeId}', [FavoriteController::class, 'store']);
    Route::delete('user/favorites/{animeId}', [FavoriteController::class, 'destroy']);

    // ── Playback access (validates subscription/license before issuing URL) ───
    Route::post('episodes/{episodeId}/playback', [PlaybackController::class, 'getPlaybackUrl']);

    // ── Subtitles (authorized access) ────────────────────────────────────────
    Route::get('episodes/{episodeId}/subtitles', [SubtitleController::class, 'index']);
    Route::get('subtitles/{id}/stream', [SubtitleController::class, 'stream'])
        ->name('subtitle.stream');

    // ── Subscriptions ─────────────────────────────────────────────────────────
    Route::get('user/subscription', [SubscriptionController::class, 'status']);
    Route::post('subscription/checkout', [SubscriptionController::class, 'createCheckout']);
    Route::post('subscription/cancel', [SubscriptionController::class, 'cancel']);

    // ── Transactions ──────────────────────────────────────────────────────────
    Route::get('user/transactions', [SubscriptionController::class, 'transactions']);
});

// ─── Admin ────────────────────────────────────────────────────────────────────

Route::prefix('v1/admin')->middleware([
    'auth:sanctum',
    'account.active',
    'role:super_admin|content_manager|subtitle_editor|support_agent',
])->group(function () {

    // Dashboard stats
    Route::get('dashboard', [AdminDashboardController::class, 'index']);

    // Anime CRUD
    Route::apiResource('anime', AdminAnimeController::class)->except(['show']);
    Route::get('anime/{id}', [AdminAnimeController::class, 'show']);
    Route::post('anime/{id}/publish', [AdminAnimeController::class, 'publish']);
    Route::post('anime/{id}/unpublish', [AdminAnimeController::class, 'unpublish']);
    Route::post('anime/{id}/genres', [AdminAnimeController::class, 'syncGenres']);

    // Season CRUD
    Route::apiResource('seasons', AdminSeasonController::class);

    // Episode CRUD
    Route::apiResource('episodes', AdminEpisodeController::class);
    Route::put('episodes/{id}/video', [AdminEpisodeController::class, 'updateVideoSource']);

    // Genre CRUD
    Route::apiResource('genres', AdminGenreController::class)->except(['show']);

    // Subtitle management
    Route::get('subtitles', [AdminSubtitleController::class, 'index']);
    Route::post('subtitles', [AdminSubtitleController::class, 'store']);
    Route::get('subtitles/{id}', [AdminSubtitleController::class, 'show']);
    Route::post('subtitles/{id}/approve', [AdminSubtitleController::class, 'approve']);
    Route::post('subtitles/{id}/reject', [AdminSubtitleController::class, 'reject']);
    Route::delete('subtitles/{id}', [AdminSubtitleController::class, 'destroy']);

    // User management
    Route::get('users', [AdminUserController::class, 'index']);
    Route::get('users/{id}', [AdminUserController::class, 'show']);
    Route::put('users/{id}', [AdminUserController::class, 'update']);
    Route::post('users/{id}/suspend', [AdminUserController::class, 'suspend']);
    Route::post('users/{id}/activate', [AdminUserController::class, 'activate']);
    Route::post('users/{id}/roles', [AdminUserController::class, 'syncRoles']);

    // Subscription management
    Route::get('subscriptions', [AdminSubscriptionController::class, 'index']);
    Route::get('subscriptions/{id}', [AdminSubscriptionController::class, 'show']);
    Route::post('subscriptions/{id}/cancel', [AdminSubscriptionController::class, 'cancel']);
    Route::get('transactions', [AdminSubscriptionController::class, 'transactions']);

    // Audit logs
    Route::get('audit-logs', [AuditLogController::class, 'index']);
});
