<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_km')->nullable();
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_km')->nullable();
            // Stored in minor units (cents). 100 = $1.00 USD
            $table->unsignedInteger('price_cents')->default(100);
            $table->string('currency', 3)->default('USD');
            $table->enum('interval', ['monthly', 'yearly'])->default('monthly');
            $table->unsignedSmallInteger('interval_count')->default(1);
            // Features as JSON array
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index('is_active');
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans')->restrictOnDelete();
            $table->enum('status', ['active', 'cancelled', 'expired', 'past_due', 'trialing'])->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            // Provider reference
            $table->string('provider', 50)->nullable();
            $table->string('provider_subscription_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('ends_at');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
