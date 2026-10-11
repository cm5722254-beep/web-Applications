'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
} from 'lucide-react'
import { animeService, historyService } from '@/services/api'
import { LoadingSpinner } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

// ── Detect embed-only URLs (never use <video> for these) ─────────────────────
function isEmbedUrl(url: string): boolean {
  return (
    url.includes('dailymotion.com') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('ok.ru') ||
    url.includes('rumble.com') ||
    url.includes('donghuaworld') ||
    url.includes('playing.') ||
    url.includes('skylineai.cloud') ||
    url.includes('gdriveplayer') ||
    url.includes('/player/') ||
    (url.includes('/embed') && !url.endsWith('.mp4'))
  )
}

// ── Normalise YouTube shortlinks ─────────────────────────────────────────────
function embedSrc(url: string): string {
  if (url.includes('youtube.com/watch?v='))
    return url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1'
  if (url.includes('youtu.be/'))
    return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0] + '?autoplay=1'
  return url
}

// ── Fetch playback URL from /api/playback ─────────────────────────────────────
async function resolveStream(slug: string, epNum: number): Promise<string> {
  try {
    const res = await fetch(`/api/playback?anime=${encodeURIComponent(slug)}&episode=${epNum}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const json = await res.json()
      if (json?.playback_url) return json.playback_url
    }
  } catch (_e) {}
  // Hard fallback — always works
  return 'https://geo.dailymotion.com/player/xbj0x.html?video=k7EQenfojRv0sXLqOOC'
}

export default function VideoPlayerPage() {
  const { slug, season: seasonSlug, episode: episodeSlug } = useParams<{
    slug: string; season: string; episode: string
  }>()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [videoUrl, setVideoUrl]     = useState<string | null>(null)
  const [loadingStream, setLoading] = useState(true)
  const [streamError, setError]     = useState(false)
  const [retries, setRetries]       = useState(0)

  // Episode + all episodes queries
  const { data: episode, isLoading: epLoading } = useQuery({
    queryKey: ['episode', slug, seasonSlug, episodeSlug],
    queryFn: () => animeService.getEpisode(slug, seasonSlug, episodeSlug),
    enabled: !!slug && !!seasonSlug && !!episodeSlug,
    staleTime: 5 * 60_000,
  })

  const { data: allEpisodes } = useQuery({
    queryKey: ['episodes', slug, seasonSlug],
    queryFn: () => animeService.getEpisodes(slug, seasonSlug),
    enabled: !!slug && !!seasonSlug,
    staleTime: 5 * 60_000,
  })

  // ── Load stream URL as soon as we know the episode number ────────────────
  const loadStream = useCallback(async (epNum: number, prefilledUrl?: string | null) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(false)
    setVideoUrl(null)

    try {
      // Use pre-filled URL if available (avoids API round-trip)
      const url = prefilledUrl && prefilledUrl.length > 10
        ? prefilledUrl
        : await resolveStream(slug, epNum)

      setVideoUrl(url)
      setLoading(false)

      // Init native HLS / MP4 player if needed
      if (!isEmbedUrl(url)) {
        initNative(url)
      }
    } catch (_e) {
      setError(true)
      setLoading(false)
    }
  }, [slug])

  // Trigger whenever episode changes
  useEffect(() => {
    if (!episode) return
    loadStream(episode.episode_number, episode.playback_url)
    return () => {
      abortRef.current?.abort()
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [episode?.id, episode?.episode_number, loadStream])

  // ── Native HLS / MP4 initialiser ────────────────────────────────────────
  const initNative = useCallback(async (url: string) => {
    const video = videoRef.current
    if (!video) return

    if (url.includes('.m3u8')) {
      const { default: Hls } = await import('hls.js')
      if (Hls.isSupported()) {
        const hls = new Hls({ xhrSetup: (xhr) => { xhr.withCredentials = false } })
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.ERROR, (_e, data) => { if (data.fatal) setError(true) })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
      }
    } else {
      video.src = url
    }

    if (user) {
      progressInterval.current = setInterval(() => {
        if (video.currentTime > 5 && episode) {
          historyService.upsert({ episode_id: episode.id, progress_seconds: Math.floor(video.currentTime) })
        }
      }, 10_000)
    }
  }, [user, episode])

  const handleRetry = () => {
    setRetries(n => n + 1)
    if (episode) loadStream(episode.episode_number, null)
  }

  const currentEpNum = episode?.episode_number ?? 1
  const prevEp = allEpisodes?.find(e => e.episode_number === currentEpNum - 1)
  const nextEp = allEpisodes?.find(e => e.episode_number === currentEpNum + 1)

  const showLoader  = epLoading || loadingStream
  const showError   = streamError && !showLoader
  const showPlayer  = !!videoUrl && !loadingStream && !streamError
  const useIframe   = videoUrl ? isEmbedUrl(videoUrl) : false

  return (
    <div className="min-h-screen bg-[#0a0608] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 flex flex-col items-center gap-4">

        {/* Guest banner */}
        {!user && (
          <div className="w-full bg-gradient-to-r from-red-950/30 via-[#130a0b] to-rose-950/20 border border-red-500/20 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <span className="text-rose-100/60">⚡ Full HD streaming. Sign in to sync watch progress.</span>
            <a href={`/api/auth/google?redirect=/anime/${slug}/${seasonSlug}/${episodeSlug}`}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-xl shrink-0 transition-all shadow">
              Sign In
            </a>
          </div>
        )}

        {/* ── Video Box ─────────────────────────────────────────────────── */}
        <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-red-500/20 min-h-0">

          {/* Loading */}
          {showLoader && (
            <div className="aspect-video flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size={44} />
                <p className="text-red-400 text-xs font-bold tracking-widest uppercase animate-pulse">
                  Loading Stream…
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {showError && (
            <div className="aspect-video flex items-center justify-center bg-black p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-rose-100/70 text-sm font-semibold">
                  Stream unavailable — trying another server…
                </p>
                <button onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-2 transition-all">
                  <RefreshCw size={14} />
                  Retry {retries > 0 ? `(${retries})` : ''}
                </button>
              </div>
            </div>
          )}

          {/* ── Player ──────────────────────────────────────────────────── */}
          {showPlayer && (
            <>
              {useIframe ? (
                <iframe
                  key={`${slug}-${currentEpNum}-${retries}`}
                  src={embedSrc(videoUrl!)}
                  className="w-full aspect-video border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                />
              ) : (
                <video ref={videoRef}
                  className="w-full aspect-video bg-black"
                  controls autoPlay playsInline
                  onError={handleRetry}
                />
              )}
            </>
          )}

          {/* Watermark */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none select-none flex items-center gap-2 bg-black/75 backdrop-blur-sm border border-red-500/30 px-3 py-1.5 rounded-xl shadow-lg opacity-90">
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-red-400 shrink-0">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-red-300 tracking-wider">SC-ANIME KH</span>
              <span className="text-[8px] text-rose-100/40 font-bold -mt-0.5">OFFICIAL 4K STREAM</span>
            </div>
          </div>
        </div>

        {/* ── Navigation Bar ────────────────────────────────────────────── */}
        <div className="w-full flex items-center justify-between gap-3 py-1 px-1">
          <Link href={`/anime/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-rose-100/50 hover:text-red-300 transition-colors">
            <ArrowLeft size={14} /> All Episodes
          </Link>

          <div className="flex items-center gap-2">
            {prevEp && (
              <Link href={`/anime/${slug}/${seasonSlug}/${prevEp.slug}`}
                className="inline-flex items-center gap-1 text-xs bg-[#1a0a0b] hover:bg-red-600 hover:text-white border border-red-500/20 text-rose-100/60 px-3 py-1.5 rounded-xl font-bold transition-all">
                <ChevronLeft size={14} /> Prev
              </Link>
            )}

            <span className="text-xs font-black text-red-300 bg-red-500/10 border border-red-500/25 px-3 py-1.5 rounded-xl">
              Episode {currentEpNum}
            </span>

            {nextEp && (
              <Link href={`/anime/${slug}/${seasonSlug}/${nextEp.slug}`}
                className="inline-flex items-center gap-1 text-xs bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-xl font-black transition-all shadow-[0_0_12px_rgba(225,29,72,0.45)]">
                Next Ep <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* ── Episode Info Card ─────────────────────────────────────────── */}
        {episode && (
          <div className="w-full bg-[#130a0b] border border-red-500/15 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5">
              <span>Episode {episode.episode_number}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-white/50">Ultra HD Stream</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {episode.title_en || `Episode ${episode.episode_number}`}
            </h1>
            {episode.synopsis_en && (
              <p className="text-rose-100/45 text-xs sm:text-sm mt-3 leading-relaxed max-w-3xl">
                {episode.synopsis_en}
              </p>
            )}

            {/* Quick Episode Selector */}
            {allEpisodes && allEpisodes.length > 1 && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-xs font-bold text-rose-100/40 uppercase tracking-wider mb-3">
                  Quick Episode Selector
                </h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-none">
                  {allEpisodes.map((ep) => {
                    const isCurrent = ep.episode_number === currentEpNum
                    return (
                      <Link key={ep.id}
                        href={`/anime/${slug}/${seasonSlug}/${ep.slug}`}
                        className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)] scale-105'
                            : 'bg-black/40 hover:bg-red-500/15 text-rose-100/50 border border-white/5 hover:border-red-500/30'
                        }`}>
                        {ep.episode_number}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
