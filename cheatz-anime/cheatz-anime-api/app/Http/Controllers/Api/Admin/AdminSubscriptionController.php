<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentTransactionResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSubscriptionController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Subscription::with(['user', 'plan'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->paginate(20);

        return response()->json([
            'data' => SubscriptionResource::collection($subscriptions),
            'meta' => ['total' => $subscriptions->total()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $sub = Subscription::with(['user', 'plan', 'transactions'])->findOrFail($id);

        return response()->json(['data' => new SubscriptionResource($sub)]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Only super admins can cancel subscriptions.'], 403);
        }

        $sub = Subscription::findOrFail($id);
        $sub->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        $this->audit->log('subscription.admin_cancelled', $request->user(), $sub, null, $request);

        return response()->json(['message' => 'Subscription cancelled.']);
    }

    public function transactions(Request $request): JsonResponse
    {
        $query = PaymentTransaction::with(['user', 'plan'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $txns = $query->paginate(20);

        return response()->json([
            'data' => PaymentTransactionResource::collection($txns),
            'meta' => ['total' => $txns->total()],
        ]);
    }
}
