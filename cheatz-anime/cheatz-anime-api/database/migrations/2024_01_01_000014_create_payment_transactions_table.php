<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();           // our internal reference
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans')->restrictOnDelete();

            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3)->default('USD');

            $table->enum('status', ['pending', 'completed', 'failed', 'refunded', 'disputed'])->default('pending');
            $table->string('provider', 50)->default('razorpay');

            // Razorpay-specific fields
            $table->string('provider_order_id')->nullable();
            $table->string('provider_payment_id')->nullable();
            $table->string('provider_signature')->nullable();   // stored for audit, not re-used

            $table->json('provider_response')->nullable();      // raw provider payload for audit
            $table->timestamp('provider_event_at')->nullable();

            // Webhook idempotency
            $table->string('webhook_event_id')->nullable()->unique();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('provider_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
