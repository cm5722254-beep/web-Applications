# Implementation Plan: Admin User Management with Real API

## Overview
Transform the admin user management system from partial/demo state to production-ready with real paginated API, filters, search, and proper CRUD operations against https://apis.animekill.com.

**Key Discovery:** API base URL is `https://apis.animekill.com` (no `/api/v1` suffix in env). Admin endpoints are called as `/admin/users` directly through the configured apiClient.

## Implementation Order

### Feature 1: Types & Service Layer (Backend Foundation)

- [ ] 1. **Add AdminUserFilters and AdminUserUpdate interfaces to src/types/index.ts**
      
      Add `AdminUserFilters` with optional fields: `page?: number`, `per_page?: number`, `search?: string`, `status?: UserStatus`, `role?: string`, `subscribed?: boolean`.
      
      Add `AdminUserUpdate` with optional fields: `name?: string`, `status?: UserStatus`, `subscribed?: boolean`, `subscription_plan?: string | null`, `subscription_expires_at?: string | null`.
      
      Files: `src/types/index.ts`
      
      Verify: `npm run type-check` — TypeScript compilation passes with no errors

- [ ] 2. **Rewrite adminService.getUsers() to return paginated data with meta**
      
      Change signature to `getUsers(filters?: AdminUserFilters): Promise<{ users: ManagedUser[], meta: PaginationMeta }>`. Build query params from filters using axios params config. Call `apiClient.get('/admin/users', { params: filters })`. Extract `response.data.data` as users array and `response.data.meta` as pagination meta. Transform each user via transformUser. Return `{ users, meta }`.
      
      Files: `src/services/adminService.ts`
      
      Verify: `npm run type-check` passes. Manual code review confirms return type matches and query params are built correctly.

- [ ] 3. **Add new CRUD methods to adminService**
      
      Add `updateUser(userId: number, data: AdminUserUpdate): Promise<ManagedUser>` — calls `apiClient.put(\`/admin/users/\${userId}\`, data)`, transforms result, calls `syncCurrentSession(result)`, returns transformed user.
      
      Add `assignRoles(userId: number, roles: string[]): Promise<ManagedUser>` — calls `apiClient.post(\`/admin/users/\${userId}/roles\`, { roles })`, transforms, syncs session, returns user.
      
      Add `suspendUser(userId: number): Promise<ManagedUser>` — calls `apiClient.post(\`/admin/users/\${userId}/suspend\`)`, transforms, returns user.
      
      Add `activateUser(userId: number): Promise<ManagedUser>` — calls `apiClient.post(\`/admin/users/\${userId}/activate\`)`, transforms, returns user.
      
      Rewrite `deleteUser(userId: number): Promise<boolean>` — check super admin guard, call `apiClient.delete(\`/admin/users/\${userId}\`)`, return true on success / false on error.
      
      Files: `src/services/adminService.ts`
      
      Verify: `npm run type-check` passes. Code review confirms each method uses correct HTTP verb and endpoint path.

- [ ] 4. **Fix toggleStatus and refactor setVip/setRole as wrappers**
      
      Rewrite `toggleStatus(userId)` to: call `getUser(userId)` to get current status, then call `suspendUser(userId)` or `activateUser(userId)` based on current status. Properly await and return the result (ManagedUser | null).
      
      Refactor `setVip(userId, isVip, plan)` to compute expiresAt (keep existing date logic), then call `updateUser(userId, { subscribed: isVip, subscription_plan: isVip ? plan : null, subscription_expires_at: expiresAt })` and return result.
      
      Refactor `setRole(userId, role)` to map role string to roles array (keep existing logic), then call `assignRoles(userId, roles)` and return result.
      
      Files: `src/services/adminService.ts`
      
      Verify: `npm run type-check` passes. Code review confirms toggleStatus awaits properly and returns ManagedUser | null (not boolean), setVip/setRole use new methods internally.

---

### Feature 2: Admin Dashboard with Real Stats (src/app/admin/page.tsx)

- [ ] 5. **Replace derived stats with API meta.total values**
      
      Remove `usersList` and `loadingUsers` state. Add separate state: `statsLoading`, `statsError`, `totalUsers`, `vipUsers`, `adminStaff` (all numbers), `recentUsers` (ManagedUser[]), `recentLoading`, `recentError`.
      
      Create `fetchStats()` async function that makes 3 parallel API calls: `adminService.getUsers({ per_page: 1 })` for total, `adminService.getUsers({ per_page: 1, subscribed: true })` for VIP count, `adminService.getUsers({ per_page: 1, role: 'admin' })` for admin count. Extract `meta.total` from each response and set state. Handle errors with try/catch and set `statsError`. If `role='admin'` doesn't include super_admin, make a 4th call with `role='super_admin'` and sum the totals.
      
      Create `fetchRecentUsers()` async function that calls `adminService.getUsers({ per_page: 5 })`, extracts users array, sets `recentUsers` state. Handle errors.
      
      In useEffect, call both `fetchStats()` and `fetchRecentUsers()` on mount.
      
      Files: `src/app/admin/page.tsx`
      
      Verify: `npm run type-check` passes. `npm run dev` and navigate to http://localhost:3001/admin. Open DevTools Network tab and confirm 4 API calls (3 stats + 1 recent users). Verify stat numbers are not 0 and match expected backend totals.

- [ ] 6. **Add loading skeletons and error states**
      
      When `statsLoading=true`, render 4 pulsing skeleton boxes matching stat card structure with `animate-pulse` class and neutral background.
      
      When `statsError` is set, show error banner with retry button that calls `fetchStats()` again.
      
      When `recentLoading=true`, show 'Loading users...' text in recent users section.
      
      When `recentError` is set, show error message with retry button that calls `fetchRecentUsers()`.
      
      Files: `src/app/admin/page.tsx`
      
      Verify: Run dev server, throttle network in DevTools to 3G, reload page, confirm skeletons appear before data loads. Temporarily break API base URL in `.env.local`, reload, confirm error states with retry buttons appear.

---

### Feature 3: Users Management Page with Pagination (src/app/admin/users/page.tsx)

- [ ] 7. **Add pagination state and rewrite loadUsers()**
      
      Add state: `currentPage` (number, default 1), `perPage` (number, default 20), `totalPages` (number, default 1), `metaTotal` (number, default 0), `errorMsg` (string | null).
      
      Rewrite `loadUsers()` to build filters object from `searchQuery`, `filterTab`, `currentPage`, `perPage`. Map `filterTab` to API params: `'all'` → no filters, `'vip'` → `{ subscribed: true }`, `'admin'` → `{ role: 'admin' }`, `'free'` → no API filter (client-side filter or fetch all and filter subscribed=false). Call `adminService.getUsers(filters)`. Extract `users` and `meta`. Set `usersList`, `metaTotal=meta.total`, `totalPages=meta.last_page`. Catch errors and set `errorMsg`. Set `loadingUsers=false`.
      
      Add useEffect that calls `loadUsers()` when `currentPage`, `perPage`, `searchQuery`, or `filterTab` changes.
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: `npm run type-check` passes. Code review confirms filters object is built correctly and API call includes query params.

- [ ] 8. **Add debounced search (300ms)**
      
      Add local state `searchInput` (string) for immediate input value. Add debounced effect: when `searchInput` changes, set a 300ms timeout that updates `searchQuery` state (which triggers loadUsers via useEffect). Clear timeout on cleanup. Update input element to use `searchInput` for value and update `searchInput` on change, not `searchQuery` directly.
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: Run dev server, navigate to /admin/users, open Network tab, type 'test' in search box. Confirm API call only fires once 300ms after typing stops, not on every keystroke.

- [ ] 9. **Add pagination controls UI**
      
      Below the table, add pagination controls: 'Page X of Y' label, Previous button (disabled when `currentPage === 1`), page number buttons for nearby pages (e.g. currentPage-2 to currentPage+2, max 7 buttons, with ellipsis), Next button (disabled when `currentPage === totalPages`). On page button click, set `currentPage` state.
      
      Add per-page dropdown: select element with options 20, 50, 100. On change, set `perPage` state and reset `currentPage` to 1.
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: Run dev server, navigate to /admin/users. Click page 2, verify API call includes `?page=2`. Change per-page to 50, verify API call includes `per_page=50` and `page=1`. Click Previous/Next, verify page changes.

- [ ] 10. **Fix toggleStatus and suspend/activate button**
      
      In `handleToggleVip`, change to: `const res = await adminService.toggleStatus(u.id); if (res) { loadUsers(); showToast(...) } else { showToast('Failed', 'error') }`.
      
      In the table row inline suspend/activate button, change onClick from `adminService.toggleStatus(u.id) && loadUsers()` to async handler: `const res = await adminService.toggleStatus(u.id); if (res) { loadUsers(); showToast(res.status === 'active' ? 'Activated' : 'Suspended') } else { showToast('Failed', 'error') }`.
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: Run dev server, click suspend/activate button on a user. Verify API calls POST /admin/users/{id}/suspend or /activate in Network tab. Verify user status changes in UI and toast appears.

- [ ] 11. **Add loading skeleton and error state**
      
      When `loadingUsers=true`, render 5 table rows with pulsing skeleton elements matching column structure (avatar circle, text line placeholders, badge shapes).
      
      When `errorMsg` is set, show error banner above the table with message and retry button that clears `errorMsg` and calls `loadUsers()`.
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: Throttle network, reload page, confirm 5-row skeleton appears while loading. Break API URL, reload, confirm error banner with retry button appears. Click retry, confirm loadUsers is called again.

- [ ] 12. **Update filter tabs to reset page and wire to API**
      
      When filter tab button is clicked, set `currentPage` to 1 (so user doesn't land on page 5 of a filter that only has 2 pages). Verify `loadUsers()` correctly maps filterTab to API params.
      
      Update stats counts at top: derive `totalCount`, `vipCount`, `adminCount` from `metaTotal` when `filterTab='all'`. Otherwise, make 3 additional API calls with `per_page=1` and different filters to get accurate counts (same pattern as dashboard FEAT-002).
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: Run dev server, click VIP tab, verify page resets to 1 and API call includes `subscribed=true`. Click Admin tab, verify `role=admin`. Check Network tab for query params.

- [ ] 13. **Update table footer with real pagination info**
      
      Change footer text from `'Showing {filtered.length} of {totalCount} users'` to `'Showing {usersList.length} of {metaTotal} users (Page {currentPage} of {totalPages})'`.
      
      Remove `useMemo` for filtered list — API returns filtered data directly, no client-side filtering needed.
      
      Files: `src/app/admin/users/page.tsx`
      
      Verify: Run dev server, navigate to /admin/users page 2. Confirm footer shows correct page numbers and total from API meta.

---

## Cross-Feature Integration Verification

After all features are complete:

- [ ] 14. **Full end-to-end manual test**
      
      Run `npm run type-check` — must pass with zero errors.
      
      Run `npm run dev` and test:
      1. Dashboard (/admin): verify stats load from API (not array.length), recent users show 5 entries, clicking "Manage Users" navigates to users page
      2. Users page (/admin/users): verify pagination works (page 1, 2, next, prev), per-page dropdown (20/50/100), search debounce (type "test", wait 300ms, see API call), filter tabs (All/VIP/Admin/Free)
      3. User actions: Grant VIP (toggle and custom plan modal), change role dropdown, suspend/activate button, delete (confirm dialog, cannot delete super admin socheatvinchan@gmail.com)
      4. Error handling: break API URL, verify error states with retry buttons on both pages
      5. Network tab: all API calls go to https://apis.animekill.com/admin/users with correct query params (page, per_page, search, status, role, subscribed)
      
      Files: All modified files across all features
      
      Verify: All manual tests pass. API calls use correct endpoints and query params. UI updates reflect API responses. No console errors. TypeScript compilation clean.

---

## Potential Pitfalls & Notes

1. **API role filter ambiguity**: The `role=admin` query param may not include `super_admin` users. Solution: make two API calls (role=admin + role=super_admin) and sum the totals for admin count stat. Document this in code comments.

2. **Free users filter**: API may not support `subscribed=false` query param. Options: (a) fetch all users and client-side filter `!u.subscribed`, or (b) remove Free tab and only show All/VIP/Admin. Choice documented in FEAT-003 step 15.

3. **toggleStatus return type**: Current implementation returns `ManagedUser | null`, but existing code uses `&& loadUsers()` which expects boolean. Fixed in FEAT-001 step 9 and FEAT-003 steps 7-8 by properly awaiting and checking result.

4. **Super admin protection**: Email `socheatvinchan@gmail.com` is hardcoded as root super admin. Cannot be deleted or demoted. Guard exists in `deleteUser` but ensure UI also disables delete button for this user.

5. **API base URL**: Confirmed `https://apis.animekill.com` (no `/api/v1` suffix). Admin routes are `/admin/users` not `/api/v1/admin/users`. The apiClient baseURL is already correctly configured via NEXT_PUBLIC_API_BASE_URL env var.

6. **localStorage sync**: `syncCurrentSession` must be called after any user update to sync the logged-in user's cached profile if the updated user matches. Already implemented in existing code; new methods must follow this pattern.

7. **Search debounce**: 300ms is standard for search UX. Implemented with useEffect + setTimeout cleanup pattern to avoid excessive API calls while typing.

8. **Pagination reset**: When changing filters or search query, `currentPage` must reset to 1 to avoid landing on out-of-bounds pages (e.g. filter has only 2 pages but user is on page 5).
