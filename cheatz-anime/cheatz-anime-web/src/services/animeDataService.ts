import type {
  Anime,
  AnimeListItem,
  Episode,
  Genre,
  PaginatedResponse,
  PlaybackResult,
  Season,
  SubtitleTrack,
  SubscriptionPlan,
  User,
  WatchHistory,
} from '@/types'

import talesOfHerdingGodsJson from '@/data/tales_of_herding_gods.json'
import animekillCatalog from '@/data/animekill_catalog.json'
import { getKhmerTitle } from '@/lib/khmerTitleHelper'

// Staging API URL as configured, with fallback to primary API
const API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.BASE_URL ||
  'https://staging.animekill.com'
).replace(/\/+$/, '')

const FALLBACK_API = 'https://apis.animekill.com'

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface AnimeKillItem {
  sno: number
  name: string
  description_sno?: number
  synonyms?: string
  add_on_date?: string
  genre?: string
  total_watch?: number
  last_update?: string
  small_poster?: string
  large_poster?: string
  orginal_poster?: string
  anime_type?: string
  anime_origin?: string
  anime_id?: string
  rank?: string
  popularity?: string
  score?: string
  status?: string | null
  anime_id_web?: string | null
  next_episode_trailer_video_id?: string | null
  next_episode_trailer_number?: number | null
}

interface AnimeKillHomeData {
  recentlyUpdateChinese?: AnimeKillItem[]
  recentlyUpdateJapnese?: AnimeKillItem[]
  recentlyAddChinese2D?: AnimeKillItem[]
  topBannerAnime?: AnimeKillItem[]
  topPickChinese?: AnimeKillItem[]
  topPickJapnese?: AnimeKillItem[]
  completedChineseAnime?: AnimeKillItem[]
  shortDramaAnime?: AnimeKillItem[]
  popularMovies?: AnimeKillItem[]
}

// ─── Slug Generator ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u1780-\u17FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Transform AnimeKill Item to AnimeListItem ──────────────────────────────

function transformAnimeKillItem(item: AnimeKillItem): AnimeListItem {
  const poster =
    item.large_poster && item.large_poster !== 'na'
      ? item.large_poster
      : item.small_poster && item.small_poster !== 'na'
      ? item.small_poster
      : item.orginal_poster && item.orginal_poster !== 'na'
      ? item.orginal_poster
      : 'https://i7.imageban.ru/out/2025/09/20/c074099bf923ceb333b4fef17a6b916a.png'

  // Detect type from API fields
  const isChinese = item.anime_origin === 'chinese'
  const isMovie = item.anime_type === 'Movie' || (item.genre || '').toLowerCase().includes('movie')
  const is3D = item.anime_type === '3D'
  const is2D = item.anime_type === '2D'
  const isShortDrama = item.anime_type === 'ShortDrama'

  let animeType: import('@/types').AnimeType
  if (isChinese || is3D) {
    animeType = isMovie ? 'movie' : 'donghua'
  } else if (is2D) {
    animeType = 'cartoon'
  } else if (isShortDrama) {
    animeType = 'movie'
  } else {
    animeType = 'anime'
  }

  const genres: Genre[] = (item.genre || '')
    .split(',')
    .filter(Boolean)
    .map((g, idx) => ({
      id: idx + 10,
      name_en: g.trim(),
      name_km: null,
      slug: slugify(g),
      icon: null,
      is_active: true,
    }))

  const year = item.add_on_date ? new Date(item.add_on_date).getFullYear() : 2024

  return {
    id: item.sno,
    slug: item.anime_id || item.anime_id_web || slugify(item.name),
    title_en: (item.name || '').trim(),
    title_km: getKhmerTitle(item.name, item.synonyms),
    title_original: item.synonyms ? item.synonyms.split(',')[0].trim() : null,
    poster_url: poster,
    type: animeType,
    airing_status: item.status === 'Completed' ? 'completed' : 'ongoing',
    release_year: isNaN(year as number) ? 2024 : year,
    views_count: item.total_watch || 0,
    average_score: item.score ? (parseFloat(String(item.score)) || 8.8) : 8.8,
    is_premium: false,
    genres,
  }
}

// ─── Fetch AnimeKill Home Data with Caching & Resilience ────────────────────

let homeCache: AnimeKillHomeData | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchFromApi(endpoint: string, options?: RequestInit): Promise<Response | null> {
  const servers = [API_URL, FALLBACK_API]
  for (const base of servers) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 6000)
      const res = await fetch(`${base}${endpoint}`, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (res.ok) return res
    } catch (_e) {
      // Try next server
    }
  }
  return null
}

async function getHomeData(): Promise<AnimeKillHomeData> {
  const now = Date.now()
  if (homeCache && now - cacheTimestamp < CACHE_TTL) {
    return homeCache
  }

  const res = await fetchFromApi('/users/fetchHomePageAnimeTv')
  if (res) {
    try {
      const json = await res.json()
      if (json.data && typeof json.data === 'object') {
        homeCache = json.data
        cacheTimestamp = now
        return homeCache!
      }
    } catch (_e) {}
  }

  return homeCache || {}
}

// ─── Stream Video Sources ───────────────────────────────────────────────────

const STREAM_URLS = [
  'https://geo.dailymotion.com/player/xbj0x.html?video=k7EQenfojRv0sXLqOOC',
  'https://geo.dailymotion.com/player/x110cm.html?video=k5Tn5UULu9LFneL0oLc',
  'https://www.dailymotion.com/embed/video/k2TodZR82L6n4JLr9IK',
  'https://ok.ru/videoembed/5988460071520?autoplay=1&subtitles-default=en&mute=false',
  'https://www.dailymotion.com/embed/video/x983o9q?autoplay=1&subtitles-default=en&mute=false',
]

// ─── Real Anime: Tales of Herding Gods (104 Episodes) ───────────────────────

export function getTalesOfHerdingGodsAnime(): Anime {
  const raw = talesOfHerdingGodsJson as any
  const poster = 'https://animekill.com/poster/tales-of-herding-gods-hd.webp'
  const genres: Genre[] = (raw.genres || ['Action', 'Adventure', 'Fantasy']).map((name: string, i: number) => ({
    id: i + 1,
    name_en: name,
    name_km: null,
    slug: slugify(name),
    icon: null,
    is_active: true,
  }))

  const episodes: Episode[] = (raw.episodeList || []).map((ep: any) => {
    const num = ep.number
    const playback_url =
      ep.video_host && ep.video_path
        ? `https://${ep.video_host}${ep.video_path}`
        : num === 103
        ? 'https://geo.dailymotion.com/player/x110cm.html?video=k5Tn5UULu9LFneL0oLc'
        : num === 102
        ? 'https://geo.dailymotion.com/player/x110cm.html?video=k2v05Gn5BBzfpVKxwqG'
        : num === 1
        ? 'https://www.dailymotion.com/embed/video/x983o9q?autoplay=1&subtitles-default=hi&mute=false'
        : null

    return {
      id: 164589 * 1000 + num,
      season_id: 1,
      slug: `ep-${num}`,
      title_en: ep.title || `Episode ${num}`,
      title_km: `ភាគ ${num}`,
      episode_number: num,
      synopsis_en: ep.full_title || `Tales of Herding Gods Episode ${num} English Sub`,
      synopsis_km: `និទានព្រះបុរាណ ភាគទី ${num}`,
      thumbnail_url: poster,
      duration_seconds: 1200,
      has_hls: true,
      status: 'published' as const,
      is_premium: false,
      aired_at: '2024-10-04',
      playback_url,
    }
  })

  return {
    id: 164589,
    slug: 'tales-of-herding-gods',
    title_en: 'Tales of Herding Gods',
    title_km: 'និទានព្រះបុរាណ',
    title_original: '牧神记 (Mu Shen Ji)',
    poster_url: poster,
    banner_url: poster,
    type: 'donghua',
    airing_status: 'ongoing',
    release_year: 2024,
    views_count: 180757,
    average_score: 8.8,
    is_premium: false,
    genres,
    alt_titles: ['Tales of Herding Gods', 'Mushen Ji', 'Mu Shen Ji', '牧神记', 'និទានព្រះបុរាណ'],
    synopsis_en: raw.description,
    synopsis_km: 'ឈីន មូ កើតមកជាមួយនឹងរូបកាយជាមនុស្សសាមញ្ញ។ បន្ទាប់ពីឆ្លងកាត់ការលំបាកជាច្រើន លោកបានក្លាយជាមេដឹកនាំនិកាយទេវវិញ្ញាណ និងត្រូវបានតែងតាំងជាវេជ្ជបណ្ឌិតទីមួយនៃសាលារាជវាំងដោយនគរ Yankang...',
    trailer_url: 'https://www.youtube.com/watch?v=-8z6AP8jM_c',
    status: 'published',
    age_rating: 'PG-13',
    country_of_origin: 'China',
    aired_from: '2024-01-01',
    aired_to: null,
    favorites_count: 1240,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seasons: [
      {
        id: 1,
        anime_id: 164589,
        slug: 'season-1',
        title_en: 'Season 1',
        title_km: 'វគ្គ ១',
        season_number: 1,
        synopsis_en: raw.description,
        synopsis_km: null,
        poster_url: poster,
        status: 'published',
        aired_from: '2024-01-01',
        aired_to: null,
        total_episodes: 104,
        episodes,
      },
    ],
  }
}

// ─── Exported Services ──────────────────────────────────────────────────────

export const animeService = {
  async list(filters?: {
    type?: string
    genre?: string
    sort?: string
    per_page?: number
    page?: number
  }): Promise<PaginatedResponse<AnimeListItem>> {
    const home = await getHomeData()
    const perPage = filters?.per_page || 12
    const page = filters?.page || 1

    const talesAnime = getTalesOfHerdingGodsAnime()
    const talesItem: AnimeListItem = {
      id: talesAnime.id,
      slug: talesAnime.slug,
      title_en: talesAnime.title_en,
      title_km: talesAnime.title_km,
      title_original: talesAnime.title_original,
      poster_url: talesAnime.poster_url,
      type: talesAnime.type,
      airing_status: talesAnime.airing_status,
      release_year: talesAnime.release_year,
      views_count: talesAnime.views_count,
      average_score: talesAnime.average_score,
      is_premium: talesAnime.is_premium,
      genres: talesAnime.genres,
    }

    let items: AnimeListItem[] = [talesItem]

    if (filters?.type === 'donghua') {
      const chinese3D = (home.recentlyUpdateChinese || []).map(transformAnimeKillItem)
      const chinese2D = (home.recentlyAddChinese2D || []).map(transformAnimeKillItem)
      const topDonghua = (home.topPickChinese || []).map(transformAnimeKillItem)
      const completed = (home.completedChineseAnime || []).map(transformAnimeKillItem)
      const allChinese = [...chinese3D, ...topDonghua, ...chinese2D, ...completed]
      items = allChinese.filter((a) => a.type === 'donghua' || a.type === 'movie')
    } else if (filters?.type === 'anime') {
      const topPickJ = (home.topPickJapnese || []).map(transformAnimeKillItem)
      const latestJ = (home.recentlyUpdateJapnese || []).map(transformAnimeKillItem)
      items = [...topPickJ, ...latestJ].filter((a) => a.type === 'anime')
    } else if (filters?.type === 'movie') {
      const chinese3D = (home.recentlyUpdateChinese || []).map(transformAnimeKillItem)
      const movies = (home.popularMovies || []).map(transformAnimeKillItem)
      const shorts = (home.shortDramaAnime || []).map(transformAnimeKillItem)
      items = [...movies, ...shorts, ...chinese3D].filter((a) => a.type === 'movie')
    } else if (filters?.type === 'cartoon') {
      const chinese2D = (home.recentlyAddChinese2D || []).map(transformAnimeKillItem)
      const topJ = (home.topPickJapnese || []).map(transformAnimeKillItem)
      items = [...chinese2D, ...topJ].filter((a) => a.type === 'cartoon')
    } else if (filters?.sort === 'views') {
      const topPickC = (home.topPickChinese || []).map(transformAnimeKillItem)
      const topPickJ = (home.topPickJapnese || []).map(transformAnimeKillItem)
      const banners = (home.topBannerAnime || []).map(transformAnimeKillItem)
      items = [...topPickC, ...topPickJ, ...banners]
      items.sort((a, b) => b.views_count - a.views_count)
    } else if (filters?.sort === 'latest') {
      const latestC = (home.recentlyUpdateChinese || []).map(transformAnimeKillItem)
      const latestJ = (home.recentlyUpdateJapnese || []).map(transformAnimeKillItem)
      items = [...latestC, ...latestJ]
    } else if (filters?.genre) {
      try {
        const res = await fetchFromApi('/users/fetchAnimeUsingGenre', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre_name: filters.genre, page }),
        })
        if (res) {
          const json = await res.json()
          const rawList = json.data?.animeList || json.data || []
          if (Array.isArray(rawList) && rawList.length > 0) {
            items = rawList.map(transformAnimeKillItem)
          }
        }
      } catch (_e) {}
    } else {
      const banners = (home.topBannerAnime || []).map(transformAnimeKillItem)
      const latestC = (home.recentlyUpdateChinese || []).map(transformAnimeKillItem)
      const latestJ = (home.recentlyUpdateJapnese || []).map(transformAnimeKillItem)
      const movies = (home.popularMovies || []).map(transformAnimeKillItem)
      items = [...banners, ...latestC, ...latestJ, ...movies]
    }

    // Deduplicate by slug
    const seen = new Set<string>()
    const unique: AnimeListItem[] = []
    for (const item of items) {
      if (!seen.has(item.slug)) {
        seen.add(item.slug)
        unique.push(item)
      }
    }

    const start = (page - 1) * perPage
    const paginated = unique.slice(start, start + perPage)

    return {
      data: paginated,
      meta: {
        current_page: page,
        last_page: Math.ceil(unique.length / perPage) || 1,
        per_page: perPage,
        total: unique.length,
        from: start + 1,
        to: Math.min(start + perPage, unique.length),
      },
      links: {
        first: '?page=1',
        last: `?page=${Math.ceil(unique.length / perPage)}`,
        prev: page > 1 ? `?page=${page - 1}` : null,
        next: start + perPage < unique.length ? `?page=${page + 1}` : null,
      },
    }
  },

  async search(q: string, _options?: { per_page?: number }): Promise<PaginatedResponse<AnimeListItem>> {
    const home = await getHomeData()
    const allItems: AnimeListItem[] = []

    Object.values(home).forEach((cat) => {
      if (Array.isArray(cat)) {
        allItems.push(...cat.map(transformAnimeKillItem))
      }
    })

    const query = q.toLowerCase().trim()
    const matched = allItems.filter(
      (a) =>
        a.title_en.toLowerCase().includes(query) ||
        (a.title_original && a.title_original.toLowerCase().includes(query))
    )

    const seen = new Set<string>()
    const unique = matched.filter((m) => {
      if (seen.has(m.slug)) return false
      seen.add(m.slug)
      return true
    })

    return {
      data: unique,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: unique.length,
        total: unique.length,
        from: 1,
        to: unique.length,
      },
      links: { first: null, last: null, prev: null, next: null },
    }
  },

  async get(rawSlug: string): Promise<Anime> {
    let slug = rawSlug
    try {
      slug = decodeURIComponent(rawSlug)
    } catch (_e) {}

    if (
      slug.includes('tales-of-herding-gods') ||
      slug === 'mushen-ji' ||
      slug === 'mu-shen-ji' ||
      slug === 'nithean-preah-boran'
    ) {
      return getTalesOfHerdingGodsAnime()
    }

    const home = await getHomeData()
    let rawItem: AnimeKillItem | undefined

    for (const cat of Object.values(home)) {
      if (Array.isArray(cat)) {
        const found = cat.find(
          (x) =>
            x.anime_id === slug ||
            x.anime_id_web === slug ||
            slugify(x.name) === slug ||
            x.name.toLowerCase() === slug.toLowerCase()
        )
        if (found) {
          rawItem = found
          break
        }
      }
    }

    const catalogItem = (animekillCatalog.animes as Record<string, any>)?.[slug]

    const base = rawItem
      ? transformAnimeKillItem(rawItem)
      : catalogItem
      ? {
          id: Math.abs(slug.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) % 100000 + 100,
          slug,
          title_en: catalogItem.title,
          title_km: getKhmerTitle(catalogItem.title, catalogItem.title_original),
          title_original: catalogItem.title_original || null,
          poster_url: catalogItem.poster || `https://animekill.com/poster/${slug}-hd.webp`,
          type: (catalogItem.type as any) || 'donghua',
          airing_status: 'ongoing' as const,
          release_year: 2024,
          views_count: 5000,
          average_score: catalogItem.score ? parseFloat(catalogItem.score) || 8.8 : 8.8,
          is_premium: false,
          genres: (catalogItem.genres || ['Action', 'Fantasy']).map((name: string, i: number) => ({
            id: i + 1,
            name_en: name,
            name_km: null,
            slug: slugify(name),
            icon: null,
            is_active: true,
          })),
        }
      : {
          id: 100,
          slug,
          title_en: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          title_km: getKhmerTitle(slug.replace(/-/g, ' ')),
          title_original: null,
          poster_url: `https://animekill.com/poster/${slug}-hd.webp`,
          type: 'donghua' as const,
          airing_status: 'ongoing' as const,
          release_year: 2024,
          views_count: 1000,
          average_score: 9.0,
          is_premium: false,
          genres: [],
        }

    const totalEps = catalogItem?.total_episodes || Math.max(rawItem?.next_episode_trailer_number || 24, 12)

    const episodes: Episode[] = Array.from(
      { length: totalEps },
      (_, i) => ({
        id: base.id * 100 + i + 1,
        season_id: 1,
        slug: `ep-${i + 1}`,
        title_en: `Episode ${i + 1}`,
        title_km: `ភាគ ${i + 1}`,
        episode_number: i + 1,
        synopsis_en: `Episode ${i + 1} of ${base.title_en}`,
        synopsis_km: `ភាគទី ${i + 1} នៃរឿង ${base.title_en}`,
        thumbnail_url: base.poster_url,
        duration_seconds: 1200,
        has_hls: true,
        status: 'published',
        is_premium: false,
        aired_at: '2024-01-01',
      })
    )

    const trailerVideoId = rawItem?.next_episode_trailer_video_id
    const trailerUrl = trailerVideoId
      ? `https://www.youtube.com/watch?v=${trailerVideoId}`
      : null

    const seasons: Season[] = [
      {
        id: 1,
        anime_id: base.id,
        slug: 'season-1',
        title_en: 'Season 1',
        title_km: 'វគ្គ ១',
        season_number: 1,
        synopsis_en: rawItem?.synonyms || base.title_en,
        synopsis_km: null,
        poster_url: base.poster_url,
        status: 'published',
        aired_from: '2024-01-01',
        aired_to: null,
        total_episodes: totalEps,
        episodes,
      },
    ]

    return {
      ...base,
      alt_titles: rawItem?.synonyms ? rawItem.synonyms.split(',') : null,
      synopsis_en: rawItem?.synonyms || base.title_en,
      synopsis_km: null,
      banner_url: base.poster_url,
      trailer_url: trailerUrl,
      status: 'published',
      age_rating: 'PG-13',
      country_of_origin: base.type === 'donghua' ? 'China' : 'Japan',
      aired_from: '2024-01-01',
      aired_to: null,
      favorites_count: 520,
      seasons,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },

  async getSeasons(rawAnimeSlug: string): Promise<Season[]> {
    let animeSlug = rawAnimeSlug
    try {
      animeSlug = decodeURIComponent(rawAnimeSlug)
    } catch (_e) {}
    const anime = await animeService.get(animeSlug)
    return anime.seasons || []
  },

  async getEpisodes(rawAnimeSlug: string, rawSeasonSlug: string): Promise<Episode[]> {
    let animeSlug = rawAnimeSlug
    let seasonSlug = rawSeasonSlug
    try {
      animeSlug = decodeURIComponent(rawAnimeSlug)
      seasonSlug = decodeURIComponent(rawSeasonSlug)
    } catch (_e) {}
    const anime = await animeService.get(animeSlug)
    const season = anime.seasons.find((s) => s.slug === seasonSlug) || anime.seasons[0]
    return season?.episodes || []
  },

  async getEpisode(
    rawAnimeSlug: string,
    rawSeasonSlug: string,
    rawEpisodeSlug: string
  ): Promise<Episode> {
    let animeSlug = rawAnimeSlug
    let seasonSlug = rawSeasonSlug
    let episodeSlug = rawEpisodeSlug
    try {
      animeSlug = decodeURIComponent(rawAnimeSlug)
      seasonSlug = decodeURIComponent(rawSeasonSlug)
      episodeSlug = decodeURIComponent(rawEpisodeSlug)
    } catch (_e) {}
    const episodes = await animeService.getEpisodes(animeSlug, seasonSlug)
    const ep =
      episodes.find((e) => e.slug === episodeSlug) ||
      episodes[0] || {
        id: 1,
        season_id: 1,
        slug: episodeSlug,
        title_en: 'Episode 1',
        title_km: 'ភាគ ១',
        episode_number: 1,
        synopsis_en: null,
        synopsis_km: null,
        thumbnail_url: null,
        duration_seconds: 1200,
        has_hls: true,
        status: 'published',
        is_premium: false,
        aired_at: null,
      }
    return ep
  },
}

// ─── Genres Service ─────────────────────────────────────────────────────────

const GENRE_EMOJIS: Record<string, string> = {
  action: '⚔️',
  adventure: '🗺️',
  fantasy: '✨',
  comedy: '😂',
  drama: '🎭',
  'martial-arts': '🥋',
  romance: '💖',
  historical: '📜',
  supernatural: '🔮',
  demons: '😈',
  harem: '🌸',
  animation: '🎬',
  'sci-fi': '🚀',
  isekai: '🌀',
}

export const genreService = {
  async list(): Promise<Genre[]> {
    const res = await fetchFromApi('/users/fetchGenres')
    if (res) {
      try {
        const json = await res.json()
        const raw = json.data?.genres || json.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((g: { sno: number; genre_name: string; icon_image?: string }) => {
            const slug = slugify(g.genre_name)
            return {
              id: g.sno,
              name_en: g.genre_name,
              name_km: null,
              slug,
              icon: GENRE_EMOJIS[slug] || '🏷️',
              is_active: true,
            }
          })
        }
      } catch (_e) {}
    }

    return [
      { id: 1, name_en: 'Action', name_km: 'វាយប្រហារ', slug: 'action', icon: '⚔️', is_active: true },
      { id: 2, name_en: 'Fantasy', name_km: 'មន្តអាគម', slug: 'fantasy', icon: '✨', is_active: true },
      { id: 3, name_en: 'Cultivation', name_km: 'ហាត់ក្បាច់គុណ', slug: 'cultivation', icon: '🥋', is_active: true },
      { id: 4, name_en: 'Martial Arts', name_km: 'យុទ្ធសិល្ប៍', slug: 'martial-arts', icon: '🥊', is_active: true },
      { id: 5, name_en: 'Adventure', name_km: 'ផ្សងព្រេង', slug: 'adventure', icon: '🗺️', is_active: true },
      { id: 6, name_en: 'Donghua', name_km: 'ដុងហ្វ័រ', slug: 'donghua', icon: '🐉', is_active: true },
    ]
  },
}

// ─── Playback Service ───────────────────────────────────────────────────────

export const playbackService = {
  async getPlaybackUrl(
    episodeId: number,
    animeSlug?: string,
    epNum?: number
  ): Promise<PlaybackResult> {
    try {
      const q = new URLSearchParams()
      if (animeSlug) q.set('anime', animeSlug)
      if (epNum) q.set('episode', String(epNum))
      q.set('episodeId', String(episodeId))

      const res = await fetch(`/api/playback?${q.toString()}`)
      if (res.ok) {
        const json = await res.json()
        if (json?.playback_url) {
          return json
        }
      }
    } catch (_e) {
      // fallback
    }

    const stream = STREAM_URLS[episodeId % STREAM_URLS.length]
    return {
      playback_url: stream,
      type: 'embed',
      token: 'valid',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      subtitles: [],
    }
  },

  async getSubtitles(_episodeId: number): Promise<SubtitleTrack[]> {
    return []
  },
}

// ─── Auth, Favorites, History, Subscription ─────────────────────────────────

export const authService = {
  async register(data: { name: string; email: string; password: string; password_confirmation?: string }) {
    const isSuper = data.email.trim().toLowerCase() === 'socheatvinchan@gmail.com'
    const user: User = {
      id: isSuper ? 1 : Date.now(),
      name: isSuper ? 'Socheat Vinchan (Super Admin)' : data.name,
      email: data.email,
      avatar: isSuper ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' : null,
      status: 'active',
      preferred_language: 'km',
      preferred_subtitle_language: 'km',
      ads_enabled: false,
      roles: isSuper ? ['super_admin', 'admin'] : ['user'],
      subscribed: isSuper ? true : false,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_token', 'token_' + Date.now())
    }
    return { user, token: 'token', message: 'Success' }
  },

  async login(data: { email: string; password?: string }) {
    const isSuper = data.email.trim().toLowerCase() === 'socheatvinchan@gmail.com'
    let existingSubscribed = isSuper ? true : false
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.email?.toLowerCase() === data.email.toLowerCase()) {
            existingSubscribed = isSuper ? true : (parsed.subscribed ?? false)
          }
        } catch {}
      }
    }

    const user: User = {
      id: isSuper ? 1 : Date.now(),
      name: isSuper ? 'Socheat Vinchan (Super Admin)' : data.email.split('@')[0],
      email: data.email,
      avatar: isSuper ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' : null,
      status: 'active',
      preferred_language: 'km',
      preferred_subtitle_language: 'km',
      ads_enabled: false,
      roles: isSuper ? ['super_admin', 'admin'] : ['user'],
      subscribed: existingSubscribed,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_token', 'token_' + Date.now())
    }
    return { user, token: 'token' }
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    }
  },

  async me(): Promise<User> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        const u = JSON.parse(stored)
        if (u.email?.toLowerCase() === 'socheatvinchan@gmail.com') {
          u.roles = ['super_admin', 'admin']
          u.subscribed = true
        }
        return u
      }
    }
    return {
      id: 1,
      name: 'User',
      email: 'user@cheatz.anime',
      avatar: null,
      status: 'active',
      preferred_language: 'km',
      preferred_subtitle_language: 'km',
      ads_enabled: false,
      roles: ['user'],
      subscribed: false,
      email_verified_at: null,
      created_at: new Date().toISOString(),
    }
  },
}

export const favoritesService = {
  async list(): Promise<PaginatedResponse<AnimeListItem>> {
    let favIds: number[] = []
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cheatz_favorites')
      if (raw) favIds = JSON.parse(raw)
    }
    const all = await animeService.list({ per_page: 50 })
    const filtered = all.data.filter((a) => favIds.includes(a.id))
    return {
      data: filtered,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: filtered.length,
        from: 1,
        to: filtered.length,
      },
      links: { first: null, last: null, prev: null, next: null },
    }
  },

  async add(animeId: number) {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cheatz_favorites')
      const favIds: number[] = raw ? JSON.parse(raw) : []
      if (!favIds.includes(animeId)) {
        favIds.push(animeId)
        localStorage.setItem('cheatz_favorites', JSON.stringify(favIds))
      }
    }
  },

  async remove(animeId: number) {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cheatz_favorites')
      if (raw) {
        const favIds: number[] = JSON.parse(raw).filter((id: number) => id !== animeId)
        localStorage.setItem('cheatz_favorites', JSON.stringify(favIds))
      }
    }
  },
}

export const historyService = {
  async list(): Promise<PaginatedResponse<WatchHistory>> {
    let items: WatchHistory[] = []
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cheatz_history')
      if (raw) items = JSON.parse(raw)
    }
    return {
      data: items,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: items.length,
        from: 1,
        to: items.length,
      },
      links: { first: null, last: null, prev: null, next: null },
    }
  },

  async upsert(data: { episode_id: number; progress_seconds: number }) {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cheatz_history')
      const items: WatchHistory[] = raw ? JSON.parse(raw) : []
      const existing = items.find((x) => x.episode_id === data.episode_id)
      if (existing) {
        existing.progress_seconds = data.progress_seconds
        existing.updated_at = new Date().toISOString()
      } else {
        items.unshift({
          id: Date.now(),
          user_id: 1,
          episode_id: data.episode_id,
          progress_seconds: data.progress_seconds,
          duration_seconds: 1200,
          completed: false,
          last_watched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
      localStorage.setItem('cheatz_history', JSON.stringify(items.slice(0, 50)))
    }
  },

  async remove(id: number) {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cheatz_history')
      if (raw) {
        const items = JSON.parse(raw).filter((x: WatchHistory) => x.id !== id)
        localStorage.setItem('cheatz_history', JSON.stringify(items))
      }
    }
  },

  async clearAll() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cheatz_history')
    }
  },
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    return [
      {
        id: 1,
        name_en: 'VIP Lifetime Unlimited',
        name_km: 'សមាជិក VIP មើលបានរហូត ($1)',
        slug: 'vip-lifetime',
        price_cents: 100,
        price: 1.0,
        price_usd: 1.0,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'បង់តែ $1 មើលបានរហូតគ្រប់រឿង',
          'ទស្សនារឿងចិន ដុងហ្វ័រ ភាពយន្ត គំនូរជីវចល',
          'កម្រិតរូបភាពច្បាស់ Full HD 1080p / 4K',
          'គ្មានការផ្សាយពាណិជ្ជកម្មរំខាន ១០០%',
          'ទស្សនាភាគថ្មីៗមុនគេបំផុត',
        ],
        is_active: true,
        is_featured: true,
      },
    ]
  },

  async getStatus(): Promise<{ subscribed: boolean; subscription: import('@/types').Subscription | null }> {
    let isVip = false
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          isVip = !!user.subscribed
        } catch {}
      }
    }
    return {
      subscribed: isVip,
      subscription: isVip
        ? {
            id: 1,
            status: 'active',
            starts_at: new Date().toISOString(),
            ends_at: null,
            cancelled_at: null,
            provider: 'cheatz',
            plan: {
              id: 1,
              name_en: 'VIP Premium Monthly',
              name_km: 'សមាជិក VIP ប្រចាំខែ',
              slug: 'vip-monthly',
              price_cents: 100,
              price: 1.0,
              currency: 'USD',
              interval: 'monthly',
              features: ['Full HD 1080p', 'No Ads', 'Early Episode Access'],
              is_active: true,
            },
            created_at: new Date().toISOString(),
          }
        : null,
    }
  },

  async activateVip() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          user.subscribed = true
          localStorage.setItem('auth_user', JSON.stringify(user))
          return user
        } catch {}
      }
    }
    return null
  },

  async createCheckout(_planId: number) {
    return {
      order_id: 'order_' + Date.now(),
      amount: 100,
      currency: 'USD',
      key_id: '',
      description: 'VIP Membership',
    }
  },

  async cancel() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          user.subscribed = false
          localStorage.setItem('auth_user', JSON.stringify(user))
        } catch {}
      }
    }
    return { message: 'Cancelled' }
  },
}

// ─── Weekly Schedule Service ───────────────────────────────────────────────

export interface ScheduleAnimeItem {
  anime_id: string
  name: string
  anime_origin: string
  anime_type: string
  small_poster: string
  weekday: string
  episode_number: number
  max_episode_number: number
  slug: string
}

export const scheduleService = {
  async getWeeklySchedule(): Promise<Record<string, ScheduleAnimeItem[]>> {
    try {
      const res = await fetchFromApi('/users/fetchSchduleWiseAnime')
      if (res) {
        const json = await res.json()
        const rawList = json.data?.animeSuggestions || []
        const days: Record<string, ScheduleAnimeItem[]> = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        }
        for (const item of rawList) {
          const day = item.weekday || 'Sunday'
          if (!days[day]) days[day] = []
          days[day].push({
            anime_id: item.anime_id,
            name: item.name,
            anime_origin: item.anime_origin,
            anime_type: item.anime_type,
            small_poster: item.small_poster || `https://animekill.com/poster/${item.anime_id}-hd.webp`,
            weekday: day,
            episode_number: item.episodeNumber || 1,
            max_episode_number: item.maxEpisodeNumber || item.episodeNumber || 1,
            slug: item.anime_id,
          })
        }
        return days
      }
    } catch (_e) {}
    return {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    }
  },
}


