# Backlog

Items below are ordered by priority. Each lists why it matters and what "done" looks like.

## P0 — Must Fix Before Continuing

### 1. Derive Focus Stats from `sessionLog`
**Why:** Completing a real session today doesn't change anything in the right column. The bar chart, totals, sessions count, and completion rate all read from a hardcoded constant (`data/focusStats.ts:14-28`). Users who complete sessions will believe the product is broken.

**Acceptance**
- A `useWeeklyStats()` hook (or selector) in `src/state/` reads `focusStore.sessionLog` and returns a `FocusStatsData` for the last 7 calendar days (Mon–Sun in local TZ).
- `RightPanel.tsx` passes that into `<FocusStatsPanel data={…} />`.
- `WEEK_STATS` becomes the empty-state fallback when `sessionLog` is empty (or is deleted entirely if seeded data is undesirable).
- A session ended today shows up in today's bar within 1 second.

### 2. Make Active Project cards clickable
**Why:** The mockup and the surrounding product reads as if projects are pickable. They render with hover styles and a ring, but clicking does nothing (`ActiveProjectsPanel.tsx:11-50`). Either the cards are interactive or they're a status list — right now they're both, which is worse than either.

**Acceptance**
- Clicking a row calls a single store action that sets the focus session's project (project name + optionally project id) and brings the timer into view (scroll, focus, or both).
- Cursor + hover + focus styles communicate interactivity.
- "Manage" is either removed or becomes a real button that opens a project-edit modal.

### 3. Decide nav: route or remove
**Why:** Seven nav items in the sidebar plus four in the bottom bar all look clickable, but `cursor-default` and no `onClick` mean nothing happens. Users will click "Focus Sessions" or "Insights" expecting another view. Either ship the views or visually demote the nav so it doesn't lie.

**Acceptance**
- Either: introduce a minimal in-app view switcher (no router needed — a `currentView` in a UI store + conditional render in `MainContent`) so at least one nav item leads somewhere. **Or:** remove the nav rendering entirely from Sidebar/BottomBar until the views exist, leaving only the Today affordance + logo.
- "View All" (`FocusLadderPanel.tsx`) and "Manage" (`ActiveProjectsPanel.tsx`) get the same treatment (wire or remove).
- The disabled Quick Add FAB (`BottomBar.tsx:48-56`) either gets a handler or is visually demoted.

## P1 — Core Product Completion

### 4. Tier auto-progression
**Why:** XP accumulates from completed sessions (once XP-awarding is wired) but `currentTierId` never increments. The ladder is the product's namesake; it has to actually advance.

**Acceptance**
- `submitReflection` (and/or `tick()` on natural completion) awards XP based on `actualDurationSec` and the planned tier.
- When `xp >= tier.xpToNext`, `currentTierId` advances by 1 and `xp` rolls over (or resets — see `OPEN_QUESTIONS.md`).
- The change is visible in the sidebar tier card and the right-panel ladder without a refresh.

### 5. Session log / reflection history view
**Why:** Reflections are being collected (`focusStore.sessionLog`) but never displayed. The data is the product — users can't see their own history.

**Acceptance**
- A panel (right-column or a new nav view) lists recent sessions with project, duration, completion flag, and reflection summary.
- Empty state when `sessionLog` is empty.

### 6. "Start Session from Daily Plan"
**Why:** `setDailyPlan` already rewrites `focusStore.project`, `task`, and `durationSec` (`focusStore.ts:167-180`). But there is no obvious CTA after submitting the plan, so users may not realize the next session will use it.

**Acceptance**
- After Plan-My-Day submit, the focus card visually reflects the plan (already partially true via the project/task strings).
- A small "From your plan" badge near the project name (or similar affordance) when `dailyPlan != null`.
- A "Clear plan" button surfaces somewhere (already an action — `clearDailyPlan` — just no UI).

### 7. Replace `focusStore.project` (string) with `projectId`
**Why:** Long-term history breaks if a project is renamed. Cheap now, expensive later.

**Acceptance**
- `focusStore` stores `projectId: string | null` plus a derived `useProjectName(id)`.
- `setDailyPlan`, `SessionReflectionModal`, `FocusSessionCard` all read project name through the lookup.
- Persisted shape bump → add a `migrate` function that converts old `project` strings to ids by name.

## P2 — Polish and UX Improvements

### 8. Settings panel (duration, break, name, theme)
**Why:** Default duration is locked at 35 min (`DEFAULT_DURATION_SEC = 35 * 60` in `focusStore.ts:7`), break is locked at "Short Break 5 min" (`focusStore.ts:122`), user name is hardcoded as "Alex". Trivial to expose.

**Acceptance**
- Settings modal opens from the profile chevron (`Sidebar.tsx:236`).
- Edits to default duration, break minutes, and display name persist and are reflected immediately.

### 9. Project CRUD
**Why:** `projectStore` already exposes `upsertProject` / `removeProject` (`projectStore.ts:17-27`) but no UI uses them.

**Acceptance**
- "Manage" → modal that lists projects, allows rename, color change, weekly goal change, add, delete.

### 10. Icon + visual tweaks for mockup parity
- Swap Project Streak `Target` → `Zap` (`Sidebar.tsx:209`).
- Profile avatar: either keep letter or wire an image. (Decide in OPEN_QUESTIONS.)
- Optional: thicker timer ring stroke (`FocusSessionCard.tsx:99`) to better match mockup.

### 11. Mobile experience
**Why:** Sidebar + RightPanel are `hidden lg:flex`. On phones, the user sees the timer + ideas only. Tier, ladder, stats, and projects are inaccessible.

**Acceptance**
- Either a tabbed mobile layout (Today / Stats / Projects) or a single-page-scroll layout that stacks the right panel below the main column under `lg`.

## P3 — Later / Advanced

### 12. Real distraction blocking
**Why:** The three flag chips (`FocusSessionCard.tsx:170-194`) are visual only. Users will eventually notice they don't *do* anything.

**Acceptance:** Browser permission flow to enable a real blocker (Notification API mute, fullscreen, etc.) — or rename them to "intent" to avoid misleading users.

### 13. Notifications
- Session-complete notification (Web Notifications API).
- Break-over reminder.

### 14. Multi-day planning / weekly review
- Plan-My-Day expands to a week. Sunday-evening review prompt that surfaces aggregated reflection data.

### 15. Authentication and sync
- Out-of-scope for the current single-user-on-one-device target. Listed only so we don't accidentally architect it in.
