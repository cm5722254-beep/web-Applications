# Implementation Plan: Video Health Check & Auto-Repair System

## Project Context

**Tech Stack:** Next.js 14 (App Router), TypeScript, Axios, Lucide React Icons, Tailwind CSS  
**Backend API:** Laravel @ https://apis.animekill.com (configured via NEXT_PUBLIC_API_BASE_URL)  
**Build Command:** `npm run build`  
**Dev Command:** `npm dev -p 3001`  
**Test Command:** None configured (manual testing required)  
**Type Check:** `npm run type-check`

**Key Conventions:**
- Admin pages: `'use client'` components in `src/app/admin/`
- Design language: cyan/dark theme (`bg-[#07080f]`, `border-cyan-500/25`, `rounded-2xl`, `font-extrabold` headings)
- API calls: use `apiClient` from `src/lib/api.ts` (axios instance with Bearer token interceptor)
- Service layer pattern: export typed functions in `src/services/`
- Admin access control: `useAuth()` hook checks `isAdmin` and `isSuperAdmin`
- Route handlers: Next.js 14 App Router pattern (`src/app/api/[path]/route.ts`)

**Existing Admin Modules:**
- `/admin` — dashboard with module grid cards
- `/admin/users` — VIP management, role assignment, user CRUD
- `/admin/anime` — catalog VIP-only toggle (localStorage-based override)

---

## Implementation Steps

- [ ] **1. Add VideoHealth types to src/types/index.ts**
  
  Append the following types to the existing types file (after the WeeklySchedule type):
  
  ```typescript
  // ── Video Health Check Types ─────────────────────────────────────────────────
  
  export const VIDEO_CHECK_STATUSES = ['unchecked', 'checking', 'working', 'broken', 'fixed'] as const
  export type VideoCheckStatus = (typeof VIDEO_CHECK_STATUSES)[number]
  
  export interface VideoHealthEntry {
    readonly episodeId: number
    animeId: number
    animeSlug: string
    animeTitle: string
    seasonId: number
    episodeNumber: number
    episodeSlug: string
    currentUrl: string | null
    status: VideoCheckStatus
    errorDetails: string | null
    lastChecked: string | null
    fixedUrl: string | null
    fixedAt: string | null
  }
  
  export interface VideoHealthStats {
    total: number
    unchecked: number
    working: number
    broken: number
    fixed: number
    checking: number
  }
  
  export interface VideoScanProgress {
    isScanning: boolean
    currentIndex: number
    totalCount: number
    lastUpdate: string
    currentAnime: string | null
  }
  ```
  
  **Files:** `src/types/index.ts`  
  **Verify:** `npm run type-check` passes with no errors in the types file.

---

- [ ] **2. Create src/services/videoHealthService.ts**
  
  Implement the video health service with in-memory state management (no backend storage needed on frontend):
  
  - `healthMap`: Map<episodeId, VideoHealthEntry> — stores all scan results
  - `scanProgress`: VideoScanProgress — current scan state
  - `checkVideoUrl(url: string, timeoutMs?: number): Promise<{ ok: boolean; error?: string }>` — HEAD request with 8s timeout; returns `{ ok: false, error: 'CORS blocked' }` for CORS failures, `{ ok: false, error: 'Timeout' }` for timeouts, `{ ok: true }` for 2xx responses
  - `scanAllEpisodes(onProgress?: (current: number, total: number) => void): Promise<void>` — fetches all anime from GET /admin/anime (paginated), then for each anime fetches episodes from GET /admin/anime/{id}/episodes, checks each episode's playback_url, updates healthMap; calls onProgress callback after each batch
  - `getHealthStats(): VideoHealthStats` — aggregates counts from healthMap
  - `getHealthEntries(filter?: VideoCheckStatus): VideoHealthEntry[]` — returns filtered entries
  - `getScanProgress(): VideoScanProgress` — returns current scan state
  - `updateEpisodeStatus(episodeId: number, status: VideoCheckStatus, data?: Partial<VideoHealthEntry>): void` — updates healthMap entry
  
  Import apiClient from `@/lib/api`, use axios HEAD requests for URL checks with `timeout: 8000` and `validateStatus: () => true` to prevent axios throwing on 4xx/5xx. Wrap fetch calls in try/catch to handle network errors gracefully.
  
  **Files:** `src/services/videoHealthService.ts`  
  **Verify:** `npm run type-check` passes; manual import test in a dummy component confirms exports.

---

- [ ] **3. Create src/services/videoSourceFinder.ts**
  
  Implement alternative video source finder:
  
  - `findAlternativeSource(animeSlug: string, episodeNumber: number, animeTitle?: string): Promise<string | null>` — returns first working Dailymotion URL or null
  
  Strategy (try in order, return on first success):
  
  1. **Backend playback API**: GET /api/v1/playback?anime={slug}&episode={number} (pass auth token from localStorage; expects `{ playback_url: string }`; check that URL with HEAD request)
  2. **Local playback route**: GET /api/playback?anime={slug}&ep={number} (Next.js route handler that scrapes animekill; see src/app/api/playback/route.ts for reference)
  3. **Dailymotion search API** (public, no auth): GET https://api.dailymotion.com/videos?search={animeTitle}+episode+{number}+english+sub&fields=id&limit=3; for each result, build embed URL `https://geo.dailymotion.com/player/xbj0x.html?video={id}&autoplay=1` and HEAD-check it; return first that returns 2xx
  4. Return null if all fail
  
  Use axios with 8s timeout for all requests. Log failures to console for debugging.
  
  **Files:** `src/services/videoSourceFinder.ts`  
  **Verify:** `npm run type-check` passes; manual test import.

---

- [ ] **4. Create src/app/api/admin/videos/scan/route.ts**
  
  POST /api/admin/videos/scan — starts full scan  
  GET /api/admin/videos/scan — returns current scan progress and stats
  
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { videoHealthService } from '@/services/videoHealthService'
  
  export async function POST(req: NextRequest) {
    // Start scan in background (don't await, return immediately)
    videoHealthService.scanAllEpisodes().catch(err => console.error('Scan error:', err))
    return NextResponse.json({ message: 'Scan started', progress: videoHealthService.getScanProgress() })
  }
  
  export async function GET(req: NextRequest) {
    return NextResponse.json({
      progress: videoHealthService.getScanProgress(),
      stats: videoHealthService.getHealthStats(),
    })
  }
  ```
  
  **Files:** `src/app/api/admin/videos/scan/route.ts`  
  **Verify:** `curl -X POST http://localhost:3001/api/admin/videos/scan` returns `{ message: 'Scan started', progress: {...} }`; GET returns progress and stats.

---

- [ ] **5. Create src/app/api/admin/videos/check/route.ts**
  
  POST /api/admin/videos/check — checks single URL  
  Body: `{ episodeId: number, url: string }`  
  Response: `{ ok: boolean, error?: string }`
  
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { videoHealthService } from '@/services/videoHealthService'
  
  export async function POST(req: NextRequest) {
    const { episodeId, url } = await req.json()
    if (!episodeId || !url) return NextResponse.json({ error: 'episodeId and url required' }, { status: 400 })
    
    const result = await videoHealthService.checkVideoUrl(url)
    
    // Update health map
    videoHealthService.updateEpisodeStatus(episodeId, result.ok ? 'working' : 'broken', {
      currentUrl: url,
      errorDetails: result.error || null,
      lastChecked: new Date().toISOString(),
    })
    
    return NextResponse.json(result)
  }
  ```
  
  **Files:** `src/app/api/admin/videos/check/route.ts`  
  **Verify:** `curl -X POST -H "Content-Type: application/json" -d '{"episodeId":1,"url":"https://example.com"}' http://localhost:3001/api/admin/videos/check` returns `{ ok: false, error: '...' }` or `{ ok: true }`.

---

- [ ] **6. Create src/app/api/admin/videos/fix/route.ts**
  
  POST /api/admin/videos/fix — auto-finds and applies alternative source  
  Body: `{ episodeId: number }`  
  Response: `{ success: boolean, newUrl?: string, error?: string }`
  
  Steps:
  1. Get episode entry from videoHealthService.getHealthEntries()
  2. Call videoSourceFinder.findAlternativeSource(animeSlug, episodeNumber, animeTitle)
  3. If found, update backend via PUT /admin/episodes/{episodeId} with `{ playback_url: newUrl }`
  4. Update healthMap: status='fixed', fixedUrl=newUrl, fixedAt=now
  5. Return success response
  
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { apiClient } from '@/lib/api'
  import { videoHealthService } from '@/services/videoHealthService'
  import { videoSourceFinder } from '@/services/videoSourceFinder'
  
  export async function POST(req: NextRequest) {
    const { episodeId } = await req.json()
    if (!episodeId) return NextResponse.json({ error: 'episodeId required' }, { status: 400 })
    
    const entries = videoHealthService.getHealthEntries()
    const entry = entries.find(e => e.episodeId === episodeId)
    if (!entry) return NextResponse.json({ error: 'Episode not found in health map' }, { status: 404 })
    
    const newUrl = await videoSourceFinder.findAlternativeSource(entry.animeSlug, entry.episodeNumber, entry.animeTitle)
    if (!newUrl) return NextResponse.json({ success: false, error: 'No alternative source found' })
    
    // Update backend
    try {
      await apiClient.put(`/admin/episodes/${episodeId}`, { playback_url: newUrl })
      videoHealthService.updateEpisodeStatus(episodeId, 'fixed', {
        fixedUrl: newUrl,
        fixedAt: new Date().toISOString(),
      })
      return NextResponse.json({ success: true, newUrl })
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
  }
  ```
  
  **Files:** `src/app/api/admin/videos/fix/route.ts`  
  **Verify:** With dev server running, POST with a valid episodeId from the health map; confirm backend episode is updated and response contains newUrl.

---

- [ ] **7. Create src/app/api/admin/videos/update/route.ts**
  
  POST /api/admin/videos/update — manually updates video URL  
  Body: `{ episodeId: number, newUrl: string }`  
  Response: `{ success: boolean, error?: string }`
  
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { apiClient } from '@/lib/api'
  import { videoHealthService } from '@/services/videoHealthService'
  
  export async function POST(req: NextRequest) {
    const { episodeId, newUrl } = await req.json()
    if (!episodeId || !newUrl) return NextResponse.json({ error: 'episodeId and newUrl required' }, { status: 400 })
    
    try {
      await apiClient.put(`/admin/episodes/${episodeId}`, { playback_url: newUrl })
      videoHealthService.updateEpisodeStatus(episodeId, 'fixed', {
        fixedUrl: newUrl,
        fixedAt: new Date().toISOString(),
      })
      return NextResponse.json({ success: true })
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
  }
  ```
  
  **Files:** `src/app/api/admin/videos/update/route.ts`  
  **Verify:** POST with episodeId and newUrl; confirm backend episode is updated and local health map reflects 'fixed' status.

---

- [ ] **8. Create src/app/api/admin/videos/status/route.ts**
  
  GET /api/admin/videos/status — returns scan progress and aggregated stats
  
  ```typescript
  import { NextResponse } from 'next/server'
  import { videoHealthService } from '@/services/videoHealthService'
  
  export async function GET() {
    return NextResponse.json({
      progress: videoHealthService.getScanProgress(),
      stats: videoHealthService.getHealthStats(),
    })
  }
  ```
  
  **Files:** `src/app/api/admin/videos/status/route.ts`  
  **Verify:** `curl http://localhost:3001/api/admin/videos/status` returns current progress and stats JSON.

---

- [ ] **9. Create src/app/admin/videos/health/page.tsx**
  
  Admin dashboard page for video health monitoring and repair. Design matches existing admin pages:
  
  - **Header section**: Cyan gradient hero with icon badge "VIDEO HEALTH", title "វីដេអូ Health Check & Repair", subtitle describing functionality, back button to /admin
  - **Stats cards row**: 5 cards (Total Episodes, Working, Broken, Fixed, Checking) with animated count-up on load; use Lucide icons (Film, Check, XCircle, Wrench, Loader2); colors: total=cyan, working=emerald, broken=red, fixed=amber, checking=blue
  - **Scan controls**: "Scan All Videos" button (gradient cyan-600 to sky-600, disabled during scan, shows "Scanning..." + progress %), "Auto-Fix All Broken" button (amber gradient, confirms before bulk fix, shows progress modal during fix)
  - **Progress bar**: Visible during scan; cyan gradient fill, shows current/total and percentage
  - **Filters**: Tabs for All / Working / Broken / Fixed; search input (filters by anime title or episode number)
  - **Table**: Columns: Anime (poster thumbnail + title), Episode (number + slug), Current URL (truncated with copy button), Status (badge: working=emerald, broken=red, fixed=amber with checkmark, checking=blue with spinner), Last Checked (relative time), Actions (Auto-Fix button, Find Alternative dropdown with manual URL input modal, Re-Check button)
  - **Empty state**: "No videos scanned yet. Click 'Scan All Videos' to start." with decorative icon
  - **Loading state**: Skeleton rows while fetching
  
  Use `useState` + `useEffect` to poll `/api/admin/videos/status` every 3 seconds during scan. Use `useAuth()` for access control (redirect non-admins). Use Navbar component from `@/components/layout/Navbar`.
  
  Implement row actions:
  - **Auto-Fix**: POST to /api/admin/videos/fix with episodeId, show toast on success/failure, refetch status
  - **Re-Check**: POST to /api/admin/videos/check with episodeId and currentUrl, update row status in real-time
  - **Manual URL**: Modal with text input and "Apply" button, POST to /api/admin/videos/update
  
  Bulk Auto-Fix All:
  1. Filter broken entries
  2. Confirm with modal: "Fix {count} broken videos? This will search for alternatives and update the database."
  3. Show progress modal with animated progress bar and current anime title
  4. For each broken entry, POST to /api/admin/videos/fix sequentially (to avoid rate limiting)
  5. Close modal, refetch status, show toast with success count
  
  **Files:** `src/app/admin/videos/health/page.tsx`  
  **Verify:** Navigate to http://localhost:3001/admin/videos/health; page renders with stats, scan button works, table shows entries after scan, filters work, actions trigger API calls and update UI, bulk fix shows progress modal and completes successfully.

---

- [ ] **10. Add Video Health card to Admin Dashboard (src/app/admin/page.tsx)**
  
  Insert a new module card in the Admin Modules grid (after the existing 3 cards, before the Recent Users section):
  
  ```typescript
  {
    href: '/admin/videos/health', icon: Film, color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20', hover: 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]',
    title: 'Video Health Check',
    titleKm: 'ពិនិត្យវីដេអូខូច',
    desc: 'ស្កែនរកវីដេអូដែលខូច, Auto-fix ដោយស្វ័យប្រវត្តិ',
    cta: 'Check Videos',
  },
  ```
  
  Position: after the "Live Website Preview" card, making it the 4th card in the 3-column grid (which will wrap to a new row).
  
  **Files:** `src/app/admin/page.tsx`  
  **Verify:** Navigate to http://localhost:3001/admin; new "Video Health Check" card appears in the modules grid; clicking it navigates to /admin/videos/health.

---

- [ ] **11. Final integration test and polish**
  
  Test the complete flow:
  
  1. Log in as admin, navigate to /admin
  2. Click "Video Health Check" card → lands on /admin/videos/health
  3. Click "Scan All Videos" → progress bar animates, stats update in real-time, table populates
  4. Filter to "Broken" tab → only broken videos show
  5. Click "Auto-Fix" on a broken video → loading state, then status changes to "fixed" or shows error toast
  6. Click "Auto-Fix All Broken" → confirmation modal, progress modal with current anime title, completion toast
  7. Search for an anime title → table filters correctly
  8. Click "Re-Check" on a fixed video → status updates to "working" or "broken"
  9. Click "Find Alternative" → modal opens, paste URL, click Apply → backend updates, status changes to "fixed"
  10. Refresh page → stats and table persist (because they're in module-level state in videoHealthService)
  
  Polish:
  - Add `loading` state to all buttons during async operations
  - Show error toasts for network failures with retry suggestion
  - Add empty state when no videos match filters: "No {filter} videos found"
  - Ensure long anime titles truncate with ellipsis in table
  - Add hover states to all interactive elements
  - Verify responsive layout on mobile (stack stats cards, horizontal scroll for table)
  - Add keyboard shortcuts: Esc to close modals, Enter to submit forms
  
  **Files:** All files from steps 1-10  
  **Verify:** Manual end-to-end test following the flow above; all interactions work smoothly, no console errors, UI is responsive and polished, toast notifications appear for all user actions, loading states prevent double-clicks.

---

## Design Tokens Reference

Match the existing admin design language exactly:

**Colors:**
- Background: `bg-[#07080f]`
- Cards: `bg-[#0d0f1a]`
- Borders: `border-cyan-500/15` (default), `border-cyan-500/25` (hover), `border-cyan-500/40` (focus)
- Text: white primary, `text-neutral-400` secondary, `text-neutral-500` tertiary
- Accent: cyan-500 (primary), amber-500 (VIP), emerald-500 (success), red-500 (error)

**Typography:**
- Headings: `font-extrabold` + `text-2xl` or `text-3xl`
- Body: `text-sm` or `text-xs`, `font-sans`
- Labels: `text-xs`, `text-neutral-500`, `font-semibold`, `uppercase`, `tracking-wider`

**Borders & Radii:**
- Cards: `rounded-2xl` or `rounded-3xl`
- Buttons: `rounded-xl`
- Inputs: `rounded-xl`
- Badges: `rounded-full` or `rounded-lg`

**Shadows:**
- Glows: `shadow-[0_0_20px_rgba(0,212,255,0.15)]`
- Cards: `shadow-xl`

**Icons:**
- Lucide React, size 16-20 for buttons, 24 for card headers
- Use `fill="currentColor"` for solid icons (Crown, Star)

---

## Notes

- **No backend changes required**: All admin endpoints already exist in the Laravel API (see docs/API.md)
- **Frontend-only state**: videoHealthService uses module-level Map to store scan results; state persists for the session but is lost on page refresh (acceptable for admin tool; can be upgraded to IndexedDB later if needed)
- **Scan performance**: Full catalog scan may take 5-10 minutes for 1000+ episodes; show progress clearly and allow cancellation in future iteration
- **Video URL checking**: HEAD requests to Dailymotion URLs may be blocked by CORS; in that case, service returns `{ ok: false, error: 'CORS blocked' }` and treats as unknown (not broken); Auto-Fix will attempt to find alternative
- **Rate limiting**: Backend may rate-limit /admin/anime and /admin/episodes endpoints; implement exponential backoff or batch requests if needed
- **Security**: All admin routes require authentication via Bearer token in localStorage (enforced by apiClient interceptor); pages use useAuth hook to verify isAdmin

---

## Success Criteria

✅ Admin can scan all anime episodes for broken video URLs  
✅ Dashboard shows real-time scan progress with stats (total, working, broken, fixed)  
✅ Broken videos are clearly marked in a filterable/searchable table  
✅ Auto-Fix button finds and applies alternative Dailymotion sources  
✅ Bulk "Auto-Fix All Broken" processes multiple videos with progress feedback  
✅ Manual URL input allows admin to paste a replacement URL  
✅ All UI matches existing admin design language (cyan/dark theme, rounded-2xl cards, extrabold headings)  
✅ Page is accessible from Admin Dashboard via new module card  
✅ No console errors, type-check passes, responsive on mobile  
✅ State persists during session (lost on refresh is acceptable)

---

**Plan complete. Ready for implementation.**
