<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class RazorpayController extends Controller
{
    public function __construct(private PaymentService $payment) {}

    /**
     * Handle Razorpay webhook.
     * Signature verification is performed inside PaymentService.
     * Subscription is activated ONLY after verified payment.captured.
     */
    public function webhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $signature = $request->header('X-Razorpay-Signature', '');
        $rawBody   = $request->getContent();
        $payload   = json_decode($rawBody, true) ?? [];

        $result = $this->payment->handleWebhook($payload, $rawBody, $signature);

        if (! $result['success']) {
            return response()->json(
                ['message' => $result['error'] ?? 'Webhook error.'],
                $result['status'] ?? 422
            );
        }

        return response()->json(['status' => 'ok']);
    }
}
