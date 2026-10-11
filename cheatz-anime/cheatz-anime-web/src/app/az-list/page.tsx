'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import catalog from '@/data/animekill_catalog.json'
import { Search, ListFilter, Play, ChevronDown } from 'lucide-react'

const LETTERS = ['All', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
const INITIAL_LIMIT = 48
const BATCH_SIZE = 48

export default function AzListPage() {
  const [selectedLetter, setSelectedLetter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(INITIAL_LIMIT)

  const allAnimes = useMemo(() => {
    const map = (catalog.animes || {}) as Record<string, any>
    return Object.values(map).sort((a, b) => a.title.localeCompare(b.title))
  }, [])

  const filteredAnimes = useMemo(() => {
    return allAnimes.filter((anime) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = anime.title.toLowerCase().includes(q)
        const matchesSynonyms = anime.synonyms ? anime.synonyms.toLowerCase().includes(q) : false
        if (!matchesTitle && !matchesSynonyms) return false
      }

      // Letter filter
      if (selectedLetter === 'All') return true
      const firstChar = anime.title.trim().charAt(0).toUpperCase()
      if (selectedLetter === '0-9') {
        return /\d/.test(firstChar)
      }
      return firstChar === selectedLetter
    })
  }, [allAnimes, selectedLetter, searchQuery])

  const displayedAnimes = useMemo(() => {
    return filteredAnimes.slice(0, limit)
  }, [filteredAnimes, limit])

  const totalResults = allAnimes.length || 1386
  const displayedCount = Math.min(limit, filteredAnimes.length)

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter)
    setLimit(INITIAL_LIMIT)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-violet/20 text-brand-glow border border-brand-violet/30">
              <ListFilter size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                A-Z Anime Directory
              </h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                Complete catalog of Donghua, Anime, and Movies ({totalResults} series indexed)
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search among ${totalResults} series...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setLimit(INITIAL_LIMIT)
              }}
              className="w-full bg-[#0d0f1a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-400 transition-colors"
            />
          </div>
        </div>

        {/* Letter Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 bg-brand-surface/50 p-2 rounded-2xl border border-brand-border">
          {LETTERS.map((letter) => {
            const isActive = selectedLetter === letter
            return (
              <button
                key={letter}
                onClick={() => handleLetterChange(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/30'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {/* AnimeKill Exact Matching Results Counter */}
        <div className="mb-6 text-sm text-gray-300 font-medium flex items-center justify-between">
          <div>
            Showing <span className="font-bold text-white">{displayedCount}</span> of{' '}
            <span className="font-bold text-white">{filteredAnimes.length}</span> results
          </div>
          {selectedLetter !== 'All' && (
            <button
              onClick={() => handleLetterChange('All')}
              className="text-xs text-brand-glow hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Grid of All 1,386 Anime Cards */}
        {filteredAnimes.length === 0 ? (
          <div className="text-center py-20 bg-brand-surface/30 rounded-2xl border border-brand-border/50">
            <p className="text-brand-muted text-base">
              No anime found starting with &quot;{selectedLetter}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {displayedAnimes.map((anime) => {
              const watchUrl = `/anime/${anime.slug}`
              const poster = anime.poster || `https://animekill.com/poster/${anime.slug}-hd.webp`
              const type = (anime.anime_type || '').toUpperCase()

              return (
                <Link
                  key={anime.slug}
                  href={watchUrl}
                  className="group relative flex flex-col rounded-xl overflow-hidden bg-brand-surface border border-brand-border hover:border-brand-violet/50 hover:shadow-xl hover:shadow-brand-violet/10 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Poster */}
                  <div className="relative aspect-[3/4] w-full bg-black/40 overflow-hidden">
                    <img
                      src={poster}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'https://animekill.com/poster/tales-of-herding-gods-hd.webp'
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Anime Type Badge (3D / 2D / SHORT_DRAMA_ANIME) */}
                    {type && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase shadow-md ${
                            type === '3D'
                              ? 'bg-teal-400 text-black'
                              : type === '2D'
                              ? 'bg-emerald-400 text-black'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {type}
                        </span>
                      </div>
                    )}

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-brand-violet/90 text-white flex items-center justify-center shadow-lg shadow-brand-violet/40 transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={20} className="fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-brand-text group-hover:text-brand-glow transition-colors leading-snug">
                        {anime.title}
                      </h3>
                      {anime.synonyms && (
                        <p className="text-[10px] text-brand-muted truncate mt-1">
                          {anime.synonyms}
                        </p>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-brand-muted">
                      <span className="text-brand-glow font-medium">
                        {anime.total_episodes || 24} ភាគ
                      </span>
                      <span>HD</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Load More Button */}
        {limit < filteredAnimes.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setLimit((prev) => prev + BATCH_SIZE)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-violet text-brand-text hover:text-white text-sm font-bold shadow-lg hover:shadow-brand-violet/20 hover:scale-105 transition-all"
            >
              <span>Load More Anime ({filteredAnimes.length - limit} Remaining)</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
