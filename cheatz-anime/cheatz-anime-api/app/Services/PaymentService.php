<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Razorpay\Api\Api as RazorpayApi;

class PaymentService
{
    private ?RazorpayApi $client = null;

    private function getClient(): ?RazorpayApi
    {
        if ($this->client) {
            return $this->client;
        }

        $keyId     = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');

        if (empty($keyId) || empty($keySecret)) {
            return null;
        }

        $this->client = new RazorpayApi($keyId, $keySecret);

        return $this->client;
    }

    /**
     * Create a Razorpay order. Returns success=false if provider is not configured.
     */
    public function createOrder(User $user, SubscriptionPlan $plan): array
    {
        $client = $this->getClient();

        if (! $client) {
            return [
                'success' => false,
                'error'   => 'Payment provider (Razorpay) is not configured. ' .
                    'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.',
            ];
        }

        try {
            $reference = 'TXN-' . strtoupper(Str::random(12));

            $order = $client->order->create([
                'amount'          => $plan->price_cents,
                'currency'        => $plan->currency,
                'receipt'         => $reference,
                'payment_capture' => 1,
                'notes'           => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                ],
            ]);

            // Record the pending transaction
            PaymentTransaction::create([
                'reference'        => $reference,
                'user_id'          => $user->id,
                'plan_id'          => $plan->id,
                'amount_cents'     => $plan->price_cents,
                'currency'         => $plan->currency,
                'status'           => 'pending',
                'provider'         => 'razorpay',
                'provider_order_id'=> $order->id,
            ]);

            return [
                'success'  => true,
                'order_id' => $order->id,
            ];
        } catch (\Exception $e) {
            Log::error('Razorpay order creation failed', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'error'   => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error'   => 'Payment order creation failed. Please try again.',
            ];
        }
    }

    /**
     * Handle and verify a Razorpay webhook event.
     * Activates subscription only after verified payment.captured event.
     */
    public function handleWebhook(array $payload, string $rawBody, string $signature): array
    {
        $webhookSecret = config('services.razorpay.webhook_secret');

        if (empty($webhookSecret)) {
            return ['success' => false, 'error' => 'Webhook secret not configured.'];
        }

        // Verify signature
        $expectedSignature = hash_hmac('sha256', $rawBody, $webhookSecret);

        if (! hash_equals($expectedSignature, $signature)) {
            Log::warning('Razorpay webhook signature mismatch');

            return ['success' => false, 'error' => 'Signature mismatch.', 'status' => 400];
        }

        $eventName = $payload['event'] ?? '';
        $eventId   = $payload['payload']['payment']['entity']['id'] ?? null;

        // Idempotency: skip already-processed events
        if ($eventId && PaymentTransaction::where('webhook_event_id', $eventId)->exists()) {
            return ['success' => true, 'message' => 'Already processed.'];
        }

        if ($eventName === 'payment.captured') {
            return $this->handlePaymentCaptured($payload, $eventId);
        }

        if ($eventName === 'payment.failed') {
            return $this->handlePaymentFailed($payload, $eventId);
        }

        return ['success' => true, 'message' => 'Event not handled: ' . $eventName];
    }

    private function handlePaymentCaptured(array $payload, ?string $eventId): array
    {
        $payment = $payload['payload']['payment']['entity'] ?? [];
        $orderId = $payment['order_id'] ?? null;

        if (! $orderId) {
            return ['success' => false, 'error' => 'No order ID in payload.'];
        }

        $transaction = PaymentTransaction::where('provider_order_id', $orderId)
            ->where('status', 'pending')
            ->first();

        if (! $transaction) {
            Log::warning('Razorpay webhook: no pending transaction for order', ['order_id' => $orderId]);

            return ['success' => false, 'error' => 'Transaction not found.'];
        }

        DB::transaction(function () use ($transaction, $payment, $eventId) {
            $plan = SubscriptionPlan::findOrFail($transaction->plan_id);

            // Create subscription
            $endsAt = match ($plan->interval) {
                'yearly' => now()->addYears($plan->interval_count),
                default  => now()->addMonths($plan->interval_count),
            };

            $subscription = Subscription::create([
                'user_id'    => $transaction->user_id,
                'plan_id'    => $plan->id,
                'status'     => 'active',
                'starts_at'  => now(),
                'ends_at'    => $endsAt,
                'provider'   => 'razorpay',
            ]);

            // Mark transaction as completed
            $transaction->update([
                'subscription_id'    => $subscription->id,
                'status'             => 'completed',
                'provider_payment_id'=> $payment['id'] ?? null,
                'provider_response'  => $payment,
                'provider_event_at'  => now(),
                'webhook_event_id'   => $eventId,
            ]);
        });

        return ['success' => true];
    }

    private function handlePaymentFailed(array $payload, ?string $eventId): array
    {
        $payment = $payload['payload']['payment']['entity'] ?? [];
        $orderId = $payment['order_id'] ?? null;

        if ($orderId) {
            PaymentTransaction::where('provider_order_id', $orderId)
                ->where('status', 'pending')
                ->update([
                    'status'           => 'failed',
                    'provider_response'=> $payment,
                    'webhook_event_id' => $eventId,
                ]);
        }

        return ['success' => true];
    }
}
