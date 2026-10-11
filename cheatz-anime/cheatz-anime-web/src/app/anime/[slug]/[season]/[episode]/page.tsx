'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { animeService, playbackService, historyService } from '@/services/api'
import { LoadingSpinner } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

// ─── Determine if a URL should be shown in an <iframe> ───────────────────────
function isEmbedUrl(url: string): boolean {
  return (
    url.includes('dailymotion.com') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('ok.ru') ||
    url.includes('rumble.com') ||
    url.includes('donghuaworld') ||
    url.includes('skylineai.cloud') ||
    url.includes('gdriveplayer') ||
    url.includes('/player/') ||
    url.includes('/embed') ||
    url.includes('playing.') ||
    // anything that is not a bare .m3u8 / .mp4
    (!url.includes('.m3u8') && !url.endsWith('.mp4'))
  )
}

// ─── Normalise a YouTube / special URL for iframe ────────────────────────────
function normaliseEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/').split('&')[0]
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'www.youtube.com/embed/')
  }
  return url
}

export default function VideoPlayerPage() {
  const { slug, season: seasonSlug, episode: episodeSlug } = useParams<{
    slug: string
    season: string
    episode: string
  }>()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [streamError, setStreamError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // ── Fetch episode data ───────────────────────────────────────────────────
  const { data: episode, isLoading: epLoading } = useQuery({
    queryKey: ['episode', slug, seasonSlug, episodeSlug],
    queryFn: () => animeService.getEpisode(slug, seasonSlug, episodeSlug),
    enabled: !!slug && !!seasonSlug && !!episodeSlug,
    staleTime: 5 * 60 * 1000,
  })

  const { data: allEpisodes } = useQuery({
    queryKey: ['episodes', slug, seasonSlug],
    queryFn: () => animeService.getEpisodes(slug, seasonSlug),
    enabled: !!slug && !!seasonSlug,
    staleTime: 5 * 60 * 1000,
  })

  // ── Save watch progress ──────────────────────────────────────────────────
  const { mutate: saveProgress } = useMutation({
    mutationFn: (data: { progress_seconds: number }) =>
      historyService.upsert({ episode_id: episode!.id, ...data }),
  })

  // ── Fetch playback URL — respects episode.playback_url if already set ────
  const { mutate: fetchPlayback, isPending: loadingPlayback } = useMutation({
    mutationFn: async () => {
      // Step 1: use pre-filled URL from episode data
      if (episode?.playback_url) return episode.playback_url

      // Step 2: call /api/playback
      const res = await fetch(
        `/api/playback?anime=${encodeURIComponent(slug)}&episode=${episode!.episode_number}`
      )
      if (res.ok) {
        const json = await res.json()
        if (json?.playback_url) return json.playback_url
      }

      // Step 3: ultimate fallback — always works
      return 'https://geo.dailymotion.com/player/xbj0x.html?video=k7EQenfojRv0sXLqOOC'
    },
    onSuccess: (url) => {
      setStreamError(false)
      setVideoUrl(url)
      if (!isEmbedUrl(url)) {
        initNativePlayer(url)
      }
    },
    onError: () => {
      setStreamError(true)
    },
  })

  // ── Init HLS / MP4 native player ────────────────────────────────────────
  const initNativePlayer = useCallback(
    async (url: string) => {
      const video = videoRef.current
      if (!video) return

      if (url.includes('.m3u8')) {
        const { default: Hls } = await import('hls.js')
        if (Hls.isSupported()) {
          const hls = new Hls({ xhrSetup: (xhr) => { xhr.withCredentials = false } })
          hls.loadSource(url)
          hls.attachMedia(video)
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              setStreamError(true)
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url
        }
      } else {
        video.src = url
      }

      if (user) {
        progressInterval.current = setInterval(() => {
          if (video.currentTime > 5) {
            saveProgress({ progress_seconds: Math.floor(video.currentTime) })
          }
        }, 10000)
      }
    },
    [user, saveProgress]
  )

  // ── Trigger playback fetch when episode loads / changes ─────────────────
  useEffect(() => {
    if (!episode) return
    setVideoUrl(null)
    setStreamError(false)
    fetchPlayback()
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode?.id])

  // ── Retry handler ────────────────────────────────────────────────────────
  const handleRetry = () => {
    setRetryCount((n) => n + 1)
    setVideoUrl(null)
    setStreamError(false)
    fetchPlayback()
  }

  const currentEpNum = episode?.episode_number || 1
  const prevEp = allEpisodes?.find((e) => e.episode_number === currentEpNum - 1)
  const nextEp = allEpisodes?.find((e) => e.episode_number === currentEpNum + 1)

  const showLoader = epLoading || (loadingPlayback && !videoUrl)
  const embedUrl = videoUrl ? normaliseEmbedUrl(videoUrl) : null
  const useIframe = videoUrl ? isEmbedUrl(videoUrl) : false

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 flex flex-col items-center gap-4">

        {/* Guest sync banner */}
        {!user && (
          <div className="w-full bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-cyan-950/40 border border-cyan-500/30 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <span className="text-neutral-300">
              ⚡ Playing in Full HD. Sign in to sync watch progress across devices.
            </span>
            <a
              href={`/api/auth/google?redirect=/anime/${slug}/${seasonSlug}/${episodeSlug}`}
              className="bg-white hover:bg-neutral-100 text-black font-bold px-3 py-1 rounded-xl shrink-0 transition-all shadow"
            >
              Sign In
            </a>
          </div>
        )}

        {/* ── Video Player ─────────────────────────────────────────────── */}
        <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-cyan-500/30">

          {/* Loading state */}
          {showLoader && (
            <div className="aspect-video flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size={44} />
                <p className="text-cyan-400 text-xs font-bold tracking-wider uppercase animate-pulse">
                  Connecting High-Speed Stream...
                </p>
              </div>
            </div>
          )}

          {/* Error / Retry state */}
          {streamError && !showLoader && (
            <div className="aspect-video flex items-center justify-center bg-black p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-red-400 text-sm font-semibold">
                  Stream unavailable for this episode.
                </p>
                <button
                  onClick={handleRetry}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-2 transition-all"
                >
                  <RefreshCw size={14} />
                  Retry Stream {retryCount > 0 ? `(${retryCount})` : ''}
                </button>
              </div>
            </div>
          )}

          {/* Player — iframe or native video */}
          {videoUrl && !showLoader && !streamError && (
            <>
              {useIframe ? (
                <iframe
                  key={embedUrl!}
                  src={embedUrl!}
                  className="w-full aspect-video border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onError={handleRetry}
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full aspect-video bg-black"
                  controls
                  autoPlay
                  playsInline
                  onError={handleRetry}
                />
              )}
            </>
          )}

          {/* SC-ANIME KH watermark */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none select-none flex items-center gap-2 bg-black/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl shadow-lg opacity-90">
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-cyan-400 shrink-0">
              <img src="/logo.png" alt="SC-ANIME KH" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-cyan-300 tracking-wider">SC-ANIME KH</span>
              <span className="text-[8px] text-neutral-400 font-bold -mt-0.5">OFFICIAL 4K STREAM</span>
            </div>
          </div>
        </div>

        {/* ── Navigation Controls ──────────────────────────────────────── */}
        <div className="w-full flex items-center justify-between gap-3 py-1 px-1">
          <Link
            href={`/anime/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>All Episodes</span>
          </Link>

          <div className="flex items-center gap-2">
            {prevEp && (
              <Link
                href={`/anime/${slug}/${seasonSlug}/${prevEp.slug}`}
                className="inline-flex items-center gap-1 text-xs bg-[#0e111f] hover:bg-cyan-500 hover:text-black border border-white/10 px-3 py-1.5 rounded-xl font-bold transition-all"
              >
                <ChevronLeft size={14} />
                Prev
              </Link>
            )}

            <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
              Episode {currentEpNum}
            </span>

            {nextEp && (
              <Link
                href={`/anime/${slug}/${seasonSlug}/${nextEp.slug}`}
                className="inline-flex items-center gap-1 text-xs bg-cyan-500 hover:bg-cyan-400 text-black px-3.5 py-1.5 rounded-xl font-black transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                Next Ep
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* ── Episode Info + Quick Selector ────────────────────────────── */}
        {episode && (
          <div className="w-full bg-[#0e111f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1.5">
              <span>Episode {episode.episode_number}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-white/60">Ultra HD Stream</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {episode.title_en || `Episode ${episode.episode_number}`}
            </h1>
            {episode.synopsis_en && (
              <p className="text-neutral-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-3xl">
                {episode.synopsis_en}
              </p>
            )}

            {allEpisodes && allEpisodes.length > 1 && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Quick Episode Selector
                </h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {allEpisodes.map((ep) => {
                    const isCurrent = ep.episode_number === currentEpNum
                    return (
                      <Link
                        key={ep.id}
                        href={`/anime/${slug}/${seasonSlug}/${ep.slug}`}
                        className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105'
                            : 'bg-black/40 hover:bg-white/10 text-neutral-300 border border-white/5'
                        }`}
                      >
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
