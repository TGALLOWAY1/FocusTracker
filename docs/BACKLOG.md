# Backlog

Items below are ordered by priority. Each lists why it matters and what "done" looks like.

## P0 — Must Fix Before Continuing

### 1. Derive Focus Stats from `sessionLog` ✅ Done (Slice 1)
Implemented via `src/state/useWeeklyStats.ts` (pure `bucketWeeklyStats` + thin hook). `RightPanel` and `Sidebar` both consume it. `WEEK_STATS` deleted. Empty state renders zeros + "—" for completion rate.

### 2. Make Active Project cards clickable ✅ Done (Slice 1)
Rows are now `<button>` elements that call `focusStore.setProject(name)` and smooth-scroll to `#focus-session-card`. Lying "Manage" span removed.

### 3. Decide nav: route or remove — **Partially Done**
"View All" (FocusLadderPanel) removed. "Manage" (ActiveProjectsPanel) removed. Quick Add FAB remains visibly disabled with `disabled` + `cursor-not-allowed` + tooltip — acceptable as "intentionally inactive". **Still open:** the seven Sidebar nav items and four BottomBar items remain decorative — deferred to NEXT_STEPS Slice 2.

## P1 — Core Product Completion

### 4. Tier auto-progression ✅ Done (Slice 1)
`submitReflection` and `dismissReflection` both award `xpForSession(session)` XP — 1 XP/min for the first 60 min, 3 XP/min past 60 min, plus a +5 bonus on natural completion. `applyXpAward` walks the tier ladder forward, rolling overflow into the next tier. Tier 6 (`xpToNext = Infinity`) accumulates without advancing. Sidebar tier card and Focus Ladder both update live. Seed values reset to Tier 1 / 0 XP so the ladder advances honestly from a fresh install.

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
