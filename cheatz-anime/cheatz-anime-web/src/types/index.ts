// ─────────────────────────────────────────────────────────────────────────────
// CHEATZ ANIME — Type Definitions
// Senior-level: discriminated unions, const enums, strict nulls, utility types
// ─────────────────────────────────────────────────────────────────────────────

// ── Primitive Enums ──────────────────────────────────────────────────────────

export const ANIME_TYPES = ['anime', 'donghua', 'movie', 'ova', 'ona', 'special', 'cartoon'] as const
export type AnimeType = (typeof ANIME_TYPES)[number]

export const CONTENT_STATUSES = ['draft', 'published', 'unlisted'] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export const AIRING_STATUSES = ['ongoing', 'completed', 'upcoming', 'hiatus'] as const
export type AiringStatus = (typeof AIRING_STATUSES)[number]

export const AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'R+', 'Rx'] as const
export type AgeRating = (typeof AGE_RATINGS)[number]

export const STREAM_TYPES = ['hls', 'mp4', 'embed'] as const
export type StreamType = (typeof STREAM_TYPES)[number]

export const USER_STATUSES = ['active', 'suspended', 'banned'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'expired', 'past_due', 'trialing'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const BILLING_INTERVALS = ['monthly', 'yearly', 'lifetime'] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]

export const TRANSACTION_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

export const SUBTITLE_REVIEW_STATUSES = ['pending_review', 'approved', 'rejected'] as const
export type SubtitleReviewStatus = (typeof SUBTITLE_REVIEW_STATUSES)[number]

// ── Domain Models ────────────────────────────────────────────────────────────

export interface User {
  readonly id: number
  name: string
  email: string
  avatar: string | null
  status: UserStatus
  preferred_language: string
  preferred_subtitle_language: string
  ads_enabled: boolean
  roles: string[]
  subscribed: boolean
  email_verified_at: string | null
  created_at: string
}

export interface Genre {
  readonly id: number
  name_en: string
  name_km: string | null
  slug: string
  icon: string | null
  is_active: boolean
}

export interface AnimeListItem {
  readonly id: number
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
  readonly id: number
  readonly anime_id: number
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
  readonly id: number
  readonly season_id: number
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
  readonly id: number
  readonly episode_id: number
  language_code: string
  language_name_en: string
  language_name_native: string | null
  format: string
  status: SubtitleReviewStatus
  is_default: boolean
  version: number
}

export interface WatchHistory {
  readonly id: number
  readonly episode_id: number
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
    readonly id: number
    slug: string
    title_en: string | null
    episode_number: number
    thumbnail_url: string | null
    anime?: {
      readonly id: number
      slug: string
      title_en: string
      title_km: string | null
      poster_url: string | null
    }
  }
}

export interface SubscriptionPlan {
  readonly id: number
  name_en: string
  name_km: string | null
  slug: string
  description_en?: string | null
  description_km?: string | null
  price_cents?: number
  price?: number
  price_usd?: number
  currency: string
  interval: BillingInterval
  interval_count?: number
  features: string[]
  is_featured?: boolean
  is_active?: boolean
}

export interface Subscription {
  readonly id: number
  status: SubscriptionStatus
  starts_at: string
  ends_at: string | null
  cancelled_at: string | null
  provider: string | null
  plan: SubscriptionPlan
  created_at: string
}

export interface PaymentTransaction {
  readonly id: number
  reference: string
  amount_cents: number
  amount: number
  currency: string
  status: TransactionStatus
  provider: string
  provider_order_id: string | null
  plan: SubscriptionPlan
  provider_event_at: string | null
  created_at: string
}

export interface PlaybackResult {
  playback_url: string
  expires_at: string
  type: StreamType
  subtitles: PlaybackSubtitle[]
  token?: string
}

export interface PlaybackSubtitle {
  readonly id: number
  language: string
  label: string
  url: string
  default: boolean
}

// ── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links?: PaginationLinks
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface SingleResponse<T> {
  data: T
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// ── Discriminated Unions ─────────────────────────────────────────────────────

export type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }

export type StreamState =
  | { status: 'idle' }
  | { status: 'resolving' }
  | { status: 'ready'; url: string; type: StreamType }
  | { status: 'error'; retries: number }

// ── Utility Types ────────────────────────────────────────────────────────────

/** Pick only the fields required for a card display */
export type AnimeCardData = Pick<
  AnimeListItem,
  'id' | 'slug' | 'title_en' | 'title_km' | 'poster_url' | 'type' | 'airing_status' | 'average_score' | 'genres'
> & {
  total_episodes?: number | null
}

/** Filters accepted by the anime list endpoint */
export interface AnimeListFilters {
  type?: AnimeType | string
  genre?: string
  sort?: 'views' | 'latest' | 'score' | 'az'
  per_page?: number
  page?: number
  q?: string
}

/** What gets stored in localStorage */
export interface StoredSession {
  user: User
  token: string
  expires_at?: string
}

/** Schedule item for airing schedule page */
export interface ScheduleItem {
  slug: string
  title: string
  poster: string
  episode: number
  airingTime?: string
}

export type WeeklySchedule = Record<string, ScheduleItem[]>

// ── Video Health ─────────────────────────────────────────────────────────────
export const VIDEO_CHECK_STATUSES = ['unchecked', 'working', 'broken', 'checking', 'fixed'] as const
export type VideoCheckStatus = (typeof VIDEO_CHECK_STATUSES)[number]

export interface VideoHealthEntry {
  episodeId: number
  animeId: number
  animeSlug: string
  animeTitleEn: string
  seasonNumber: number
  episodeNumber: number
  currentUrl: string | null
  status: VideoCheckStatus
  errorDetail: string | null
  fixedUrl: string | null
  checkedAt: string | null
}

export interface VideoHealthStats {
  total: number
  working: number
  broken: number
  checking: number
  fixed: number
  unchecked: number
  lastScanAt: string | null
  scanProgress: number // 0–100
  isScanning: boolean
}

// ── Admin Management Types ───────────────────────────────────────────────────

export interface AdminUserFilters {
  page?: number
  per_page?: number
  search?: string
  status?: UserStatus
  role?: string
  subscribed?: boolean
}

export interface AdminUserUpdate {
  name?: string
  status?: UserStatus
  subscribed?: boolean
  subscription_plan?: string | null
  subscription_expires_at?: string | null
}
