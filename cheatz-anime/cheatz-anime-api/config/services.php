<?php

return [

    'mailgun' => [
        'domain'    => env('MAILGUN_DOMAIN'),
        'secret'    => env('MAILGUN_SECRET'),
        'endpoint'  => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme'    => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // ─── Razorpay ─────────────────────────────────────────────────────────────
    'razorpay' => [
        'key_id'         => env('RAZORPAY_KEY_ID'),
        'key_secret'     => env('RAZORPAY_KEY_SECRET'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
    ],

    // ─── Content Provider ─────────────────────────────────────────────────────
    'content_provider' => [
        'primary'  => env('CONTENT_PROVIDER_PRIMARY'),
        'api_key'  => env('CONTENT_PROVIDER_API_KEY'),
        'api_url'  => env('CONTENT_PROVIDER_API_URL'),
    ],

];
