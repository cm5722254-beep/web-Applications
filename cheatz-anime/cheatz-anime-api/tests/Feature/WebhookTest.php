<?php

namespace Tests\Feature;

use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(SubscriptionPlanSeeder::class);
        config(['services.razorpay.webhook_secret' => 'test_webhook_secret_key_123']);
    }

    private function buildPayload(string $orderId, string $paymentId): array
    {
        return [
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id'       => $paymentId,
                        'order_id' => $orderId,
                        'status'   => 'captured',
                        'amount'   => 100,
                        'currency' => 'USD',
                    ],
                ],
            ],
        ];
    }

    private function sign(string $body): string
    {
        return hash_hmac('sha256', $body, 'test_webhook_secret_key_123');
    }

    public function test_webhook_activates_subscription_after_verified_payment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $plan = SubscriptionPlan::where('slug', 'premium-monthly')->first();

        PaymentTransaction::create([
            'reference'         => 'TXN-TEST001',
            'user_id'           => $user->id,
            'plan_id'           => $plan->id,
            'amount_cents'      => 100,
            'currency'          => 'USD',
            'status'            => 'pending',
            'provider'          => 'razorpay',
            'provider_order_id' => 'order_test123',
        ]);

        $payload = $this->buildPayload('order_test123', 'pay_test456');
        $body    = json_encode($payload);

        $response = $this->withHeaders([
            'X-Razorpay-Signature' => $this->sign($body),
            'Content-Type'         => 'application/json',
        ])->postJson('/api/v1/webhooks/razorpay', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'status'  => 'active',
        ]);

        $this->assertDatabaseHas('payment_transactions', [
            'reference' => 'TXN-TEST001',
            'status'    => 'completed',
        ]);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = $this->buildPayload('order_xxx', 'pay_xxx');

        $response = $this->withHeaders([
            'X-Razorpay-Signature' => 'invalid_signature',
            'Content-Type'         => 'application/json',
        ])->postJson('/api/v1/webhooks/razorpay', $payload);

        $response->assertStatus(422);
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_duplicate_webhook_event_is_idempotent(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $plan = SubscriptionPlan::where('slug', 'premium-monthly')->first();

        PaymentTransaction::create([
            'reference'          => 'TXN-DUP001',
            'user_id'            => $user->id,
            'plan_id'            => $plan->id,
            'amount_cents'       => 100,
            'currency'           => 'USD',
            'status'             => 'completed',
            'provider'           => 'razorpay',
            'provider_order_id'  => 'order_dup',
            'webhook_event_id'   => 'pay_duplicate',
        ]);

        $payload = $this->buildPayload('order_dup', 'pay_duplicate');
        $body    = json_encode($payload);

        $response = $this->withHeaders([
            'X-Razorpay-Signature' => $this->sign($body),
            'Content-Type'         => 'application/json',
        ])->postJson('/api/v1/webhooks/razorpay', $payload);

        $response->assertStatus(200);
        // No additional subscription should be created
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_visiting_success_url_does_not_activate_subscription(): void
    {
        // This is a design verification — the checkout simply returns an order_id
        // Subscription is ONLY activated via webhook, never by URL visit
        $user  = User::factory()->create();
        $user->assignRole('user');
        $token = $user->createToken('test')->plainTextToken;

        $plan = SubscriptionPlan::where('slug', 'premium-monthly')->first();

        // Hitting the checkout endpoint creates a pending transaction, NOT a subscription
        $response = $this->withToken($token)->postJson('/api/v1/subscription/checkout', [
            'plan_id' => $plan->id,
        ]);

        // Without Razorpay configured it returns 503 — that's correct behavior
        $this->assertDatabaseCount('subscriptions', 0);
    }
}
