<?php

namespace App\Services\ContentProviders;

use Illuminate\Support\Facades\Log;

/**
 * Null provider — used when no content provider is configured.
 * Returns safe empty responses and logs the configuration requirement.
 */
class NullContentProvider implements ContentProviderInterface
{
    public function isConfigured(): bool
    {
        return false;
    }

    public function fetchTitles(int $page = 1, int $perPage = 20): array
    {
        Log::info('Content provider not configured. Set CONTENT_PROVIDER_PRIMARY in .env');
        return [];
    }

    public function fetchTitle(string $providerId): ?array
    {
        return null;
    }

    public function getStreamUrl(string $providerEpisodeId): ?string
    {
        return null;
    }

    public function isLicensed(string $providerId, string $territory = '*'): bool
    {
        return false;
    }

    public function getName(): string
    {
        return 'null';
    }
}
