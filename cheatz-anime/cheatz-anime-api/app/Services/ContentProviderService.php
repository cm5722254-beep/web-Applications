<?php

namespace App\Services;

use App\Services\ContentProviders\ContentProviderInterface;
use App\Services\ContentProviders\NullContentProvider;

/**
 * Resolves the configured content provider.
 *
 * To add a new provider:
 * 1. Implement ContentProviderInterface
 * 2. Register it in the match() below
 * 3. Set CONTENT_PROVIDER_PRIMARY=your_provider_name in .env
 * 4. Add required credentials to .env and services.php
 */
class ContentProviderService
{
    private ContentProviderInterface $provider;

    public function __construct()
    {
        $primary = config('services.content_provider.primary', '');

        $this->provider = match (strtolower($primary)) {
            // Example: 'animekill' => new AnimekillProvider(config('services.content_provider.api_key'), ...),
            default => new NullContentProvider(),
        };
    }

    public function getProvider(): ContentProviderInterface
    {
        return $this->provider;
    }

    public function isConfigured(): bool
    {
        return $this->provider->isConfigured();
    }

    /**
     * Returns a description of what needs to be configured.
     */
    public function getSetupInstructions(): string
    {
        return <<<'TEXT'
To enable content provider integration:

1. Obtain API credentials from your licensed content provider.
2. Set CONTENT_PROVIDER_PRIMARY=<provider_name> in your .env file.
3. Set CONTENT_PROVIDER_API_KEY=<your_api_key> in your .env file.
4. Set CONTENT_PROVIDER_API_URL=<provider_api_url> in your .env file.
5. Implement a ContentProviderInterface class for your provider.
6. Register it in ContentProviderService::__construct().

IMPORTANT: Only integrate with providers that have licensed the content
for distribution in your territory. Using unlicensed content sources
violates copyright law and the platform's content policy.
TEXT;
    }
}
