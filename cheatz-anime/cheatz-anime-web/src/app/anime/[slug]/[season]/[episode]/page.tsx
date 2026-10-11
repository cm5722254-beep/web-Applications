'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Crown,
  Subtitles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { animeService, playbackService, historyService } from '@/services/api'
import { LoadingSpinner, ErrorMessage } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

export default function VideoPlayerPage() {
  const { slug, season: seasonSlug, episode: episodeSlug } = useParams<{
    slug: string
    season: string
    episode: string
  }>()
  const { user } = useAuth()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: episode, isLoading: epLoading } = useQuery({
    queryKey: ['episode', slug, seasonSlug, episodeSlug],
    queryFn: () => animeService.getEpisode(slug, seasonSlug, episodeSlug),
    enabled: !!slug && !!seasonSlug && !!episodeSlug,
  })

  const { data: allEpisodes } = useQuery({
    queryKey: ['episodes', slug, seasonSlug],
    queryFn: () => animeService.getEpisodes(slug, seasonSlug),
    enabled: !!slug && !!seasonSlug,
  })

  const isEmbedUrl = (url: string) => {
    return (
      url.includes('dailymotion.com') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('ok.ru') ||
      url.includes('rumble.com') ||
      url.includes('gdriveplayer') ||
      url.includes('skylineai.cloud') ||
      url.includes('/player/') ||
      url.includes('/embed')
    )
  }

  const { mutate: fetchPlayback, isPending: loadingPlayback } = useMutation({
    mutationFn: () => playbackService.getPlaybackUrl(episode!.id, slug, episode!.episode_number),
    onSuccess: (data) => {
      setVideoUrl(data.playback_url)
      if (data.type !== 'embed' && !isEmbedUrl(data.playback_url)) {
        initPlayer(data.playback_url, data.type as 'hls' | 'mp4')
      }
    },
    onError: () => {
      setPlaybackError('Stream temporarily unavailable. Click to reload.')
    },
  })

  const { mutate: saveProgress } = useMutation({
    mutationFn: (data: { progress_seconds: number; duration_seconds?: number; completed?: boolean }) =>
      historyService.upsert({ episode_id: episode!.id, ...data }),
  })

  useEffect(() => {
    if (episode) {
      setPlaybackError(null)
      fetchPlayback()
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [episode?.id])

  const initPlayer = async (url: string, type: 'hls' | 'mp4') => {
    const video = videoRef.current
    if (!video) return

    if (type === 'hls' && url.includes('.m3u8')) {
      const { default: Hls } = await import('hls.js')
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.withCredentials = false
          },
        })
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) setPlaybackError('Stream error. Click reload.')
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
      }
    } else {
      video.src = url
    }

    // Save progress periodically if user is logged in
    progressInterval.current = setInterval(() => {
      if (video.currentTime > 5 && user) {
        saveProgress({
          progress_seconds: Math.floor(video.currentTime),
          duration_seconds: video.duration ? Math.floor(video.duration) : undefined,
          completed: video.currentTime / video.duration > 0.9,
        })
      }
    }, 10000)
  }

  // Calculate previous and next episode numbers
  const currentEpNum = episode?.episode_number || 1
  const prevEp = allEpisodes?.find((e) => e.episode_number === currentEpNum - 1)
  const nextEp = allEpisodes?.find((e) => e.episode_number === currentEpNum + 1)

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 flex flex-col items-center">
        {/* Google Sync Prompt Banner (Optional / Non-blocking) */}
        {!user && (
          <div className="w-full mb-3 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-cyan-950/40 border border-cyan-500/30 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span className="text-neutral-300">
                Playing in Full HD. Sign in with Google to sync your watch progress across devices.
              </span>
            </div>
            <a
              href={`/api/auth/google?redirect=/anime/${slug}/${seasonSlug}/${episodeSlug}`}
              className="bg-white hover:bg-neutral-100 text-black font-bold px-3 py-1 rounded-xl shrink-0 transition-all shadow"
            >
              Google Sign-In
            </a>
          </div>
        )}

        {/* Video Player Box */}
        <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-cyan-500/30">
          {(epLoading || loadingPlayback) && (
            <div className="aspect-video flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size={44} />
                <p className="text-cyan-400 text-xs font-bold tracking-wider uppercase animate-pulse">
                  Connecting High-Speed Stream...
                </p>
              </div>
            </div>
          )}

          {playbackError && (
            <div className="aspect-video flex items-center justify-center bg-black p-6">
              <div className="text-center">
                <p className="text-red-400 text-sm font-semibold mb-3">{playbackError}</p>
                <button
                  onClick={() => {
                    setPlaybackError(null)
                    fetchPlayback()
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={13} /> Reload Player
                </button>
              </div>
            </div>
          )}

          {videoUrl && !loadingPlayback && (
            <>
              {isEmbedUrl(videoUrl) ? (
                <iframe
                  src={
                    videoUrl.includes('youtube.com/watch?v=')
                      ? videoUrl.replace('watch?v=', 'embed/')
                      : videoUrl.includes('youtu.be/')
                      ? videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                      : videoUrl
                  }
                  className="w-full aspect-video border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full aspect-video bg-black"
                  controls
                  autoPlay
                  playsInline
                  onError={() => setPlaybackError('Stream failed to load. Please click reload.')}
                />
              )}
            </>
          )}

          {/* Watermark Logo */}
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

        {/* Player Navigation Controls Bar */}
        <div className="w-full flex items-center justify-between gap-3 mt-4 py-2 px-1">
          <Link
            href={`/anime/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>All Episodes</span>
          </Link>

          <div className="flex items-center gap-2">
            {prevEp ? (
              <Link
                href={`/anime/${slug}/${seasonSlug}/${prevEp.slug}`}
                className="inline-flex items-center gap-1 text-xs bg-[#0e111f] hover:bg-cyan-500 hover:text-black border border-white/10 px-3 py-1.5 rounded-xl font-bold transition-all"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </Link>
            ) : null}

            <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
              Episode {currentEpNum}
            </span>

            {nextEp ? (
              <Link
                href={`/anime/${slug}/${seasonSlug}/${nextEp.slug}`}
                className="inline-flex items-center gap-1 text-xs bg-cyan-500 hover:bg-cyan-400 text-black px-3.5 py-1.5 rounded-xl font-black transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                <span>Next Ep</span>
                <ChevronRight size={14} />
              </Link>
            ) : null}
          </div>
        </div>

        {/* Episode Info Card */}
        {episode && (
          <div className="w-full bg-[#0e111f] border border-white/10 rounded-3xl p-6 sm:p-8 mt-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
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
              </div>
            </div>

            {/* Quick Switcher Grid for All Episodes */}
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
