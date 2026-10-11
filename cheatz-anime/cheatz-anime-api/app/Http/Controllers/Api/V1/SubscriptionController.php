<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionPlanResource;
use App\Http\Resources\SubscriptionResource;
use App\Http\Resources\PaymentTransactionResource;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(private PaymentService $payment) {}

    /**
     * List all active plans (public).
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)->orderBy('price_cents')->get();

        return response()->json(['data' => SubscriptionPlanResource::collection($plans)]);
    }

    /**
     * Get authenticated user's subscription status.
     */
    public function status(Request $request): JsonResponse
    {
        $subscription = $request->user()->activeSubscription;

        return response()->json([
            'subscribed'   => $subscription !== null,
            'subscription' => $subscription ? new SubscriptionResource($subscription->load('plan')) : null,
        ]);
    }

    /**
     * Create a Razorpay order for checkout.
     * Does NOT activate the subscription — that only happens via webhook.
     */
    public function createCheckout(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => ['required', 'integer', 'exists:subscription_plans,id'],
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        if (! $plan->is_active) {
            return response()->json(['message' => 'This plan is not available.'], 422);
        }

        $result = $this->payment->createOrder($request->user(), $plan);

        if (! $result['success']) {
            return response()->json([
                'message' => $result['error'] ?? 'Payment provider is not configured. Contact support.',
            ], 503);
        }

        return response()->json([
            'order_id'    => $result['order_id'],
            'amount'      => $plan->price_cents,
            'currency'    => $plan->currency,
            'key_id'      => config('services.razorpay.key_id'),
            'description' => $plan->name_en . ' subscription',
        ]);
    }

    /**
     * Cancel the user's active subscription.
     */
    public function cancel(Request $request): JsonResponse
    {
        $subscription = $request->user()->activeSubscription;

        if (! $subscription) {
            return response()->json(['message' => 'No active subscription found.'], 404);
        }

        $subscription->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return response()->json(['message' => 'Subscription cancelled. Access continues until ' . $subscription->ends_at?->toDateString() . '.']);
    }

    /**
     * User's transaction history.
     */
    public function transactions(Request $request): JsonResponse
    {
        $transactions = $request->user()
            ->paymentTransactions()
            ->with('plan')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => PaymentTransactionResource::collection($transactions),
            'meta' => ['current_page' => $transactions->currentPage(), 'total' => $transactions->total()],
        ]);
    }
}
