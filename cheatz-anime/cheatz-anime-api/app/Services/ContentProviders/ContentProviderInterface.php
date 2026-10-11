<?php

namespace App\Services\ContentProviders;

interface ContentProviderInterface
{
    /**
     * Check if the provider is configured and reachable.
     */
    public function isConfigured(): bool;

    /**
     * Fetch a list of available titles.
     * Returns array of normalized title metadata.
     */
    public function fetchTitles(int $page = 1, int $perPage = 20): array;

    /**
     * Fetch a specific title by its provider ID.
     */
    public function fetchTitle(string $providerId): ?array;

    /**
     * Get the stream URL for a specific episode.
     * Returns null if not available or not licensed.
     */
    public function getStreamUrl(string $providerEpisodeId): ?string;

    /**
     * Verify that the content is licensed for distribution.
     */
    public function isLicensed(string $providerId, string $territory = '*'): bool;

    /**
     * Provider name (e.g. 'animekill', 'crunchyroll').
     */
    public function getName(): string;
}
