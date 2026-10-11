# Implementation Plan: A-Z Anime List + Multiple Video Sources

## Feature 1: Enhanced A-Z Anime List Page

- [ ] 1. Add type filtering and sorting to A-Z list page
      Modify `src/app/az-list/page.tsx` to add TYPE_FILTERS tabs (All Series | Donghua | Anime | Movies) and SORT_OPTIONS dropdown (A-Z, Z-A, Latest, Most Viewed). Map catalog `anime_type`/`anime_origin` fields to filter. Ensure all 1483 anime from `animekill_catalog.json` are accessible.
      Files: `src/app/az-list/page.tsx`
      Verify: Navigate to localhost:3001/az-list, click 'All' letter filter and verify count shows 1483 results. Test type filters and sort options work correctly.

- [ ] 2. Add A-Z List link to navigation bar
      Modify `src/components/layout/Navbar.tsx` to add `{ href: '/az-list', label: 'A-Z List', matchPrefix: '/az-list' }` to NAV_LINKS array after 'Genres'.
      Files: `src/components/layout/Navbar.tsx`
      Verify: Navbar shows 'A-Z List' link that highlights cyan when on /az-list page.

## Feature 2: Multiple Video Source System

- [ ] 3. Create video source types and service
      Create `src/types/video.ts` with VideoSource interface (id, name, priority, getUrl function). Create `src/services/videoSourceFinder.ts` with VIDEO_SOURCES array (8 sources: Primary, Rumble, Dailymotion, Dailymotion 2, Odysee, Odysee 2, OK.ru, OK.ru 2) and findAlternativeSource function with caching.
      Files: `src/types/video.ts`, `src/services/videoSourceFinder.ts`
      Verify: Run `npm run type-check` and confirm no TypeScript errors.

- [ ] 4. Create server selector UI component
      Create `src/components/video/ServerSelector.tsx` with horizontal pill buttons for each source. Active source highlighted cyan with shadow. Include 'Report Broken Video' button. Use Lucide icons (Server, AlertCircle).
      Files: `src/components/video/ServerSelector.tsx`
      Verify: Component renders with 8 source buttons styled correctly (TypeScript check).

- [ ] 5. Create useVideoSources custom hook
      Create `src/hooks/useVideoSources.ts` hook that manages sources, active source, loading state, and localStorage preference per episode (key: `video_server_preference_{slug}_{epNum}`). Auto-fallback on error with max 3 retries.
      Files: `src/hooks/useVideoSources.ts`
      Verify: Run `npm run type-check` and confirm hook types are correct.

- [ ] 6. Integrate video sources into player page
      Modify `src/app/anime/[slug]/[season]/[episode]/page.tsx`: replace single videoUrl state with useVideoSources hook. Add ServerSelector below video iframe. Update iframe src to use activeSource.getUrl(). Add error handling for iframe failures.
      Files: `src/app/anime/[slug]/[season]/[episode]/page.tsx`
      Verify: Run `npm run build` and confirm build succeeds. Start dev server, login, navigate to any episode, verify ServerSelector appears below video with 8 sources.

## Final Verification

- [ ] 7. End-to-end testing of both features
      Test A-Z list: verify all 1483 anime accessible, filters work, Navbar link active. Test video sources: verify source switching works, localStorage saves preference, auto-fallback on error, Report button logs to console.
      Files: N/A (testing only)
      Verify: Manual browser testing at localhost:3001. Check DevTools console and Application > Local Storage for video preferences. Test on mobile viewport (375px) for responsive layout.
