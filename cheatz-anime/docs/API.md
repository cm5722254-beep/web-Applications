# API Documentation — CHEATZ ANIME

**Base URL:** `http://127.0.0.1:8000/api/v1`  
**Format:** JSON  
**Authentication:** Bearer token via `Authorization: Bearer <token>` header

---

## Authentication

### POST /auth/register
Register a new user. Always creates a `user` role — never admin.

**Body:** `name`, `email`, `password`, `password_confirmation`  
**Returns:** `{ user, token, message }`  
**Rate limit:** 10/min

### POST /auth/login
**Body:** `email`, `password`  
**Returns:** `{ user, token }`  
**Errors:** 401 (wrong credentials), 403 (account suspended)

### POST /auth/logout *(auth required)*
Revokes the current token.

### GET /auth/me *(auth required)*
Returns the authenticated user with roles and subscription status.

### POST /auth/forgot-password
**Body:** `email`  
Returns generic success regardless to prevent email enumeration.

### POST /auth/reset-password
**Body:** `token`, `email`, `password`, `password_confirmation`

---

## Catalog (Public)

### GET /anime
List published anime with optional filters.

**Query params:**
- `type` — anime | donghua | movie | ova | ona | special
- `genre` — genre slug
- `year` — integer
- `country` — 2-letter ISO code
- `airing_status` — ongoing | completed | upcoming | hiatus
- `sort` — latest | oldest | title | views | score
- `per_page` — 1–100 (default 24)
- `page` — page number

**Returns:** `{ data: AnimeListItem[], meta: { current_page, last_page, per_page, total } }`

### GET /anime/{slug}
Returns full anime detail with genres and published seasons.

### GET /search
**Query params:** `q` (required), `type`, `genre`, `per_page`

### GET /anime/{slug}/seasons
Returns published seasons for an anime.

### GET /anime/{animeSlug}/seasons/{seasonSlug}
Single season detail.

### GET /anime/{animeSlug}/seasons/{seasonSlug}/episodes
Published episodes for a season. Does NOT include video_source_url.

### GET /anime/{animeSlug}/seasons/{seasonSlug}/episodes/{episodeSlug}
Single episode detail. Does NOT include video_source_url.

### GET /genres
List all active genres.

### GET /plans
List all active subscription plans.

---

## Playback *(auth required)*

### POST /episodes/{id}/playback
Validates:
1. Episode is published
2. Premium episodes require active subscription
3. Anime has a valid content license

**Returns:** `{ playback_url, expires_at, type, subtitles }`

If no video source is configured: 503  
If subscription required: 403 `{ requires: "subscription" }`

---

## Subtitles *(auth required)*

### GET /episodes/{id}/subtitles
Lists approved subtitle tracks (no file paths exposed).

### GET /subtitles/{id}/stream?token={hmac}
Streams the subtitle file. Requires valid HMAC token from playback response.

---

## User *(auth required)*

### GET /user/profile
### PUT /user/profile
**Body:** `name`, `preferred_language`, `preferred_subtitle_language`

### PUT /user/password
**Body:** `current_password`, `password`, `password_confirmation`

### POST /user/avatar
Multipart form with `avatar` image file.

---

## Watch History *(auth required)*

### GET /user/history
Paginated watch history with episode and anime info.

### POST /user/history
Upsert (create or update) a watch history entry.  
**Body:** `episode_id`, `progress_seconds`, `duration_seconds?`, `completed?`, `subtitle_language?`

### DELETE /user/history/{id}
Remove a specific entry.

### DELETE /user/history
Clear all watch history.

---

## Favorites *(auth required)*

### GET /user/favorites
### POST /user/favorites/{animeId}
### DELETE /user/favorites/{animeId}

---

## Subscription *(auth required)*

### GET /user/subscription
Returns `{ subscribed: bool, subscription: Subscription | null }`

### POST /subscription/checkout
Creates a Razorpay order.  
**Body:** `plan_id`  
**Returns:** `{ order_id, amount, currency, key_id, description }`  
Returns 503 if Razorpay is not configured.

### POST /subscription/cancel
Cancels the active subscription (access continues until period end).

### GET /user/transactions
Paginated transaction history.

---

## Webhooks

### POST /webhooks/razorpay
Razorpay webhook endpoint. Verified by `X-Razorpay-Signature` header.  
Activates subscription only on `payment.captured` event.  
Idempotent — duplicate events are silently skipped.

---

## Admin *(auth + role required)*

All admin endpoints require one of: `super_admin`, `content_manager`, `subtitle_editor`, `support_agent`

### GET /admin/dashboard
Real DB metrics: users, subscribers, content counts, subtitle status, revenue.

### Anime
- `GET /admin/anime` — filter by status, type, search
- `POST /admin/anime` — create
- `GET /admin/anime/{id}`
- `PUT /admin/anime/{id}`
- `DELETE /admin/anime/{id}` — super_admin only
- `POST /admin/anime/{id}/publish`
- `POST /admin/anime/{id}/unpublish`
- `POST /admin/anime/{id}/genres` — sync genres

### Seasons
- `GET /admin/seasons?anime_id=X`
- `POST /admin/seasons`
- `GET /admin/seasons/{id}`
- `PUT /admin/seasons/{id}`
- `DELETE /admin/seasons/{id}`

### Episodes
- `GET /admin/episodes?season_id=X`
- `POST /admin/episodes`
- `PUT /admin/episodes/{id}`
- `PUT /admin/episodes/{id}/video` — set video source (content_manager+)
- `DELETE /admin/episodes/{id}`

### Genres
- `GET /admin/genres`
- `POST /admin/genres`
- `PUT /admin/genres/{id}`
- `DELETE /admin/genres/{id}`

### Subtitles
- `GET /admin/subtitles?status=pending_review`
- `POST /admin/subtitles` — upload file (multipart)
- `POST /admin/subtitles/{id}/approve`
- `POST /admin/subtitles/{id}/reject`
- `DELETE /admin/subtitles/{id}` — super_admin only

### Users
- `GET /admin/users`
- `GET /admin/users/{id}`
- `PUT /admin/users/{id}`
- `POST /admin/users/{id}/suspend`
- `POST /admin/users/{id}/activate`
- `POST /admin/users/{id}/roles` — super_admin only

### Subscriptions
- `GET /admin/subscriptions`
- `POST /admin/subscriptions/{id}/cancel` — super_admin only
- `GET /admin/transactions`

### Audit
- `GET /admin/audit-logs?action=X&user_id=Y&from=Z&to=W`

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden (suspended, wrong role) |
| 404 | Resource not found |
| 422 | Validation error `{ message, errors: { field: [messages] } }` |
| 429 | Rate limit exceeded |
| 503 | Service unavailable (provider not configured) |
