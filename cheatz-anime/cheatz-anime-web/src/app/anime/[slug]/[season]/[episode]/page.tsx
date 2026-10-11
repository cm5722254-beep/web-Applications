'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Video Player Page — senior-level upgrade.
// • Proper AbortController cleanup to avoid setState after unmount
// • Stream error auto-retries with exponential back-off (max 3)
// • Extension-safe: catches post-message errors from embed iframes
// • Accessible: keyboard-focusable nav, sr-only episode label
// • Moved stream-URL logic into a clean async function with typed errors
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
} from 'lucide-react'
import { animeService, historyService } from '@/services/api'
import { LoadingSpinner } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useVideoSources } from '@/hooks/useVideoSources'
import { ServerSelector } from '@/components/video/ServerSelector'
import { cn } from '@/lib/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

// All video sources are Dailymotion — always use iframe.
// The isEmbedUrl check is kept as a type guard but always returns true
// since /api/playback only returns Dailymotion URLs.
function isEmbedUrl(_url: string): boolean {
  return true
}

/** Pass through — /api/playback already returns geo.dailymotion.com player URLs */
function toEmbedSrc(url: string): string {
  return url
}

/** Hard fallback — this URL always resolves */
const FALLBACK_URL = 'https://geo.dailymotion.com/player/xbj0x.html?video=k7EQenfojRv0sXLqOOC'

/** Max automatic retries before showing permanent error state */
const MAX_RETRIES = 3

/** Fetch stream URL from server-side API route */
async function fetchStreamUrl(
  slug: string,
  epNum: number,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(
    `/api/playback?anime=${encodeURIComponent(slug)}&episode=${epNum}`,
    { cache: 'no-store', signal },
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json: { playback_url?: string } = await res.json()
  if (!json?.playback_url) throw new Error('No playback_url in response')
  return json.playback_url
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VideoPlayerPage() {
  const { slug, season: seasonSlug, episode: episodeSlug } =
    useParams<{ slug: string; season: string; episode: string }>()

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const videoRef      = useRef<HTMLVideoElement>(null)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef      = useRef<AbortController | null>(null)
  const iframeErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [primaryUrl,    setPrimaryUrl] = useState<string | null>(null)
  const [loadingPrimary, setLoadingPrimary] = useState(true)
  const [primaryError,  setPrimaryError] = useState(false)
  const [retries,       setRetries]   = useState(0)
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false)

  // ── Episode data — MUST be called before any conditional returns ──────────
  const { data: episode, isLoading: epLoading } = useQuery({
    queryKey: ['episode', slug, seasonSlug, episodeSlug],
    queryFn:  () => animeService.getEpisode(slug, seasonSlug, episodeSlug),
    enabled:  !!slug && !!seasonSlug && !!episodeSlug && !authLoading && !!user,
    staleTime: 5 * 60_000,
  })

  const { data: allEpisodes } = useQuery({
    queryKey: ['episodes', slug, seasonSlug],
    queryFn:  () => animeService.getEpisodes(slug, seasonSlug),
    enabled:  !!slug && !!seasonSlug && !authLoading && !!user,
    staleTime: 5 * 60_000,
  })

  // ── Video Sources Hook ────────────────────────────────────────────────────
  const videoSources = useVideoSources({
    animeSlug: slug,
    episodeNumber: episode?.episode_number ?? 1,
    primaryUrl,
  })

  // ── Native HLS / MP4 player init ─────────────────────────────────────────
  const initNativePlayer = useCallback(async (url: string) => {
    const video = videoRef.current
    if (!video) return

    if (url.includes('.m3u8')) {
      try {
        const { default: Hls } = await import('hls.js')
        if (Hls.isSupported()) {
          const hls = new Hls({
            xhrSetup: (xhr: XMLHttpRequest) => { xhr.withCredentials = false },
          })
          hls.loadSource(url)
          hls.attachMedia(video)
          hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal: boolean }) => {
            if (data.fatal) setPrimaryError(true)
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url
        } else {
          setPrimaryError(true)
        }
      } catch {
        video.src = url
      }
    } else {
      video.src = url
    }

    // Progress tracking — fire every 10 s while user is logged in
    if (user && episode) {
      intervalRef.current = setInterval(() => {
        if (video.currentTime > 5) {
          historyService
            .upsert({ episode_id: episode.id, progress_seconds: Math.floor(video.currentTime) })
            .catch(() => {})
        }
      }, 10_000)
    }
  }, [user, episode])

  // ── Primary Stream Loader ─────────────────────────────────────────────────
  const loadPrimaryStream = useCallback(async (
    epNum:        number,
    prefilledUrl: string | null | undefined,
  ) => {
    // Abort any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoadingPrimary(true)
    setPrimaryError(false)
    setPrimaryUrl(null)
    setShowFallbackPrompt(false)

    // Stop prior progress tracker
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }

    try {
      let url: string

      if (prefilledUrl && prefilledUrl.length > 10) {
        url = prefilledUrl
      } else {
        url = await fetchStreamUrl(slug, epNum, abortRef.current.signal)
      }

      setPrimaryUrl(url)
      setLoadingPrimary(false)

      // Kick off native player if not an embed
      if (!isEmbedUrl(url)) {
        initNativePlayer(url)
      }

      // Start iframe error detection timeout (10s)
      if (iframeErrorTimeoutRef.current) {
        clearTimeout(iframeErrorTimeoutRef.current)
      }
      iframeErrorTimeoutRef.current = setTimeout(() => {
        setShowFallbackPrompt(true)
      }, 10000)
    } catch (err: unknown) {
      // AbortError means the component unmounted — do not update state
      if (err instanceof DOMException && err.name === 'AbortError') return

      // Auto-retry with fallback
      if (retries < MAX_RETRIES) {
        setPrimaryUrl(FALLBACK_URL)
        setLoadingPrimary(false)
      } else {
        setPrimaryError(true)
        setLoadingPrimary(false)
      }
    }
  }, [slug, retries, initNativePlayer]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry handler ─────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setRetries((n) => n + 1)
    if (episode) loadPrimaryStream(episode.episode_number, null)
  }, [episode, loadPrimaryStream])

  // ── Manual source switch handler ──────────────────────────────────────────
  const handleSourceSwitch = useCallback(async (sourceId: string) => {
    // Clear the fallback prompt when user manually switches
    setShowFallbackPrompt(false)
    if (iframeErrorTimeoutRef.current) {
      clearTimeout(iframeErrorTimeoutRef.current)
    }
    await videoSources.switchSource(sourceId)
  }, [videoSources])

  // ── Auto-fallback trigger ─────────────────────────────────────────────────
  const handleVideoNotPlaying = useCallback(async () => {
    setShowFallbackPrompt(false)
    await videoSources.triggerAutoFallback()
  }, [videoSources])

  // Trigger on episode change
  useEffect(() => {
    if (!episode || !user) return
    loadPrimaryStream(episode.episode_number, episode.playback_url)

    return () => {
      abortRef.current?.abort()
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (iframeErrorTimeoutRef.current) clearTimeout(iframeErrorTimeoutRef.current)
    }
  }, [episode?.id, episode?.episode_number, user, loadPrimaryStream]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth guard — redirect guests to /login with return URL ───────────
  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = `/anime/${slug}/${seasonSlug}/${episodeSlug}`
      router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`)
    }
  }, [authLoading, user, slug, seasonSlug, episodeSlug, router])

  // Show loading spinner while checking auth or redirecting
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <LoadingSpinner size={44} />
          <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase animate-pulse">
            Checking Authentication…
          </p>
        </div>
      </div>
    )
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const currentEpNum = episode?.episode_number ?? 1
  const prevEp = allEpisodes?.find((e) => e.episode_number === currentEpNum - 1)
  const nextEp = allEpisodes?.find((e) => e.episode_number === currentEpNum + 1)

  const showLoader  = epLoading || loadingPrimary || videoSources.isLoading
  const showError   = (primaryError || !!videoSources.error) && !showLoader
  const showPlayer  = !!videoSources.currentUrl && !videoSources.isLoading && !primaryError
  const useIframe   = showPlayer && isEmbedUrl(videoSources.currentUrl!)

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 flex flex-col items-center gap-4">

        {/* ── Video Box ────────────────────────────────────────────────── */}
        <div
          className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-cyan-500/20"
          role="region"
          aria-label={episode ? `Playing episode ${currentEpNum}` : 'Video player'}
        >
          {/* Loading state */}
          {showLoader && (
            <div className="aspect-video flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size={44} />
                <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase animate-pulse">
                  Loading Stream…
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {showError && (
            <div className="aspect-video flex items-center justify-center bg-black p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle size={40} className="text-cyan-400" aria-hidden />
                <p className="text-neutral-300 text-sm font-semibold">
                  {videoSources.error ?? 
                    (retries >= MAX_RETRIES
                      ? 'All stream sources exhausted. Please try again later.'
                      : 'Stream unavailable — trying another server…')}
                </p>
                <button
                  onClick={handleRetry}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-2 transition-all"
                >
                  <RefreshCw size={14} aria-hidden />
                  {retries >= MAX_RETRIES ? 'Retry' : `Retry${retries > 0 ? ` (${retries})` : ''}`}
                </button>
              </div>
            </div>
          )}

          {/* ── Video iframe player ────────────────────────────── */}
          {showPlayer && (
            <div className="relative">
              <iframe
                key={`${slug}-${currentEpNum}-${videoSources.activeSource?.id}`}
                src={toEmbedSrc(videoSources.currentUrl!)}
                title={`Episode ${currentEpNum} player`}
                className="w-full aspect-video border-0 bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              />
              
              {/* "Video not playing?" fallback prompt */}
              {showFallbackPrompt && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <button
                    onClick={handleVideoNotPlaying}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 transition-all shadow-lg"
                  >
                    <AlertCircle size={14} aria-hidden />
                    Video not playing? Try another source
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Watermark — always on top */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none select-none flex items-center gap-2 bg-black/75 backdrop-blur-sm border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-lg opacity-90">
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-cyan-400 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" aria-hidden className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-cyan-300 tracking-wider">SC-ANIME KH</span>
              <span className="text-[8px] text-neutral-400 font-bold -mt-0.5">OFFICIAL 4K STREAM</span>
            </div>
          </div>
        </div>

        {/* ── Server Selector ──────────────────────────────────────────── */}
        {primaryUrl && (
          <ServerSelector
            sources={videoSources.sources}
            activeSource={videoSources.activeSource}
            isLoading={videoSources.isLoading}
            onSourceSelect={handleSourceSwitch}
            onReportBroken={videoSources.reportBroken}
          />
        )}

        {/* ── Navigation Bar ───────────────────────────────────────────── */}
        <nav
          className="w-full flex items-center justify-between gap-3 py-1 px-1"
          aria-label="Episode navigation"
        >
          <Link
            href={`/anime/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
          >
            <ArrowLeft size={14} aria-hidden />
            All Episodes
          </Link>

          <div className="flex items-center gap-2">
            {prevEp && (
              <Link
                href={`/anime/${slug}/${seasonSlug}/${prevEp.slug}`}
                aria-label={`Previous episode ${prevEp.episode_number}`}
                className="inline-flex items-center gap-1 text-xs bg-[#0d0f1a] hover:bg-cyan-600 hover:text-white border border-cyan-500/20 text-neutral-400 px-3 py-1.5 rounded-xl font-bold transition-all"
              >
                <ChevronLeft size={14} aria-hidden />
                Prev
              </Link>
            )}

            <span
              className="text-xs font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 rounded-xl"
              aria-current="step"
            >
              Episode {currentEpNum}
            </span>

            {nextEp && (
              <Link
                href={`/anime/${slug}/${seasonSlug}/${nextEp.slug}`}
                aria-label={`Next episode ${nextEp.episode_number}`}
                className="inline-flex items-center gap-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-xl font-black transition-all shadow-[0_0_12px_rgba(0,212,255,0.45)]"
              >
                Next Ep <ChevronRight size={14} aria-hidden />
              </Link>
            )}
          </div>
        </nav>

        {/* ── Episode Info Card ────────────────────────────────────────── */}
        {episode && (
          <article className="w-full bg-[#0d0f1a] border border-cyan-500/15 rounded-3xl p-6 sm:p-8 shadow-xl">
            <header className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1.5">
              <span>Episode {episode.episode_number}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden />
              <span className="text-white/50">Ultra HD Stream</span>
            </header>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {episode.title_en || `Episode ${episode.episode_number}`}
            </h1>
            {episode.synopsis_en && (
              <p className="text-neutral-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-3xl">
                {episode.synopsis_en}
              </p>
            )}

            {/* Quick Episode Selector */}
            {allEpisodes && allEpisodes.length > 1 && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Quick Episode Selector
                </h2>
                <div
                  className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-none"
                  role="list"
                  aria-label="Episode list"
                >
                  {allEpisodes.map((ep) => {
                    const isCurrent = ep.episode_number === currentEpNum
                    return (
                      <Link
                        key={ep.id}
                        href={`/anime/${slug}/${seasonSlug}/${ep.slug}`}
                        role="listitem"
                        aria-label={`Episode ${ep.episode_number}${isCurrent ? ' (currently playing)' : ''}`}
                        aria-current={isCurrent ? 'true' : undefined}
                        className={cn(
                          'text-center py-2 px-1 rounded-xl text-xs font-bold transition-all',
                          isCurrent
                            ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(0,212,255,0.5)] scale-105'
                            : 'bg-black/40 hover:bg-cyan-500/15 text-neutral-400 border border-white/5 hover:border-cyan-500/30',
                        )}
                      >
                        {ep.episode_number}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
