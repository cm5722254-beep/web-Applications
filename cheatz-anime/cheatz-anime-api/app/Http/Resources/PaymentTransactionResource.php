<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'reference'        => $this->reference,
            'amount_cents'     => $this->amount_cents,
            'amount'           => $this->amount,
            'currency'         => $this->currency,
            'status'           => $this->status,
            'provider'         => $this->provider,
            'provider_order_id'=> $this->provider_order_id,
            // provider_signature and raw responses NOT exposed
            'plan'             => $this->whenLoaded('plan', fn () => new SubscriptionPlanResource($this->plan)),
            'user'             => $this->whenLoaded('user', fn () => ['id' => $this->user->id, 'name' => $this->user->name]),
            'provider_event_at'=> $this->provider_event_at,
            'created_at'       => $this->created_at,
        ];
    }
}
