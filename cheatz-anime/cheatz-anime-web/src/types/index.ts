// ─── Core Types ─────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  status: 'active' | 'suspended' | 'banned'
  preferred_language: string
  preferred_subtitle_language: string
  ads_enabled: boolean
  roles: string[]
  subscribed: boolean
  email_verified_at: string | null
  created_at: string
}

export interface Genre {
  id: number
  name_en: string
  name_km: string | null
  slug: string
  icon: string | null
  is_active: boolean
}

export interface AnimeListItem {
  id: number
  slug: string
  title_en: string
  title_km: string | null
  title_original: string | null
  poster_url: string | null
  type: AnimeType
  airing_status: AiringStatus
  release_year: number | null
  views_count: number
  average_score: number | null
  is_premium: boolean
  genres: Genre[]
}

export interface Anime extends AnimeListItem {
  alt_titles: string[] | null
  synopsis_en: string | null
  synopsis_km: string | null
  banner_url: string | null
  trailer_url: string | null
  status: ContentStatus
  age_rating: AgeRating
  country_of_origin: string
  aired_from: string | null
  aired_to: string | null
  favorites_count: number
  seasons: Season[]
  created_at: string
  updated_at: string
}

export interface Season {
  id: number
  anime_id: number
  slug: string
  title_en: string | null
  title_km: string | null
  season_number: number
  synopsis_en: string | null
  synopsis_km: string | null
  poster_url: string | null
  status: ContentStatus
  aired_from: string | null
  aired_to: string | null
  total_episodes: number | null
  episodes?: Episode[]
}

export interface Episode {
  id: number
  season_id: number
  slug: string
  title_en: string | null
  title_km: string | null
  episode_number: number
  synopsis_en: string | null
  synopsis_km: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  has_hls: boolean
  status: ContentStatus
  is_premium: boolean
  aired_at: string | null
  playback_url?: string | null
}

export interface SubtitleTrack {
  id: number
  episode_id: number
  language_code: string
  language_name_en: string
  language_name_native: string | null
  format: string
  status: 'pending_review' | 'approved' | 'rejected'
  is_default: boolean
  version: number
}

export interface WatchHistory {
  id: number
  episode_id: number
  anime_id?: number
  user_id?: number
  progress_seconds: number
  duration_seconds: number | null
  completed: boolean
  subtitle_language?: string | null
  last_watched_at: string
  created_at?: string
  updated_at?: string
  episode?: {
    id: number
    slug: string
    title_en: string | null
    episode_number: number
    thumbnail_url: string | null
    anime?: {
      id: number
      slug: string
      title_en: string
      title_km: string | null
      poster_url: string | null
    }
  }
}

export interface SubscriptionPlan {
  id: number
  name_en: string
  name_km: string | null
  slug: string
  description_en?: string | null
  description_km?: string | null
  price_cents?: number
  price?: number
  price_usd?: number
  currency: string
  interval: 'monthly' | 'yearly'
  interval_count?: number
  features: string[]
  is_featured?: boolean
  is_active?: boolean
}

export interface Subscription {
  id: number
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing'
  starts_at: string
  ends_at: string | null
  cancelled_at: string | null
  provider: string | null
  plan: SubscriptionPlan
  created_at: string
}

export interface PaymentTransaction {
  id: number
  reference: string
  amount_cents: number
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  provider: string
  provider_order_id: string | null
  plan: SubscriptionPlan
  provider_event_at: string | null
  created_at: string
}

export interface PlaybackResult {
  playback_url: string
  expires_at: string
  type: 'hls' | 'mp4' | 'embed'
  subtitles: PlaybackSubtitle[]
  token?: string
}

export interface PlaybackSubtitle {
  id: number
  language: string
  label: string
  url: string
  default: boolean
}

// ─── Enums ─────────────────────────────────────────────────────────────────

export type AnimeType = 'anime' | 'donghua' | 'movie' | 'ova' | 'ona' | 'special' | 'cartoon'
export type ContentStatus = 'draft' | 'published' | 'unlisted'
export type AiringStatus = 'ongoing' | 'completed' | 'upcoming' | 'hiatus'
export type AgeRating = 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx'

// ─── API Response Wrappers ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number
    to?: number
  }
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface SingleResponse<T> {
  data: T
}

