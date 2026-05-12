# Prioritized Backlog

Synthesis of `PRODUCT_GAPS.md`, `CODE_QUALITY_AUDIT.md`, and `PERSISTENCE_AUDIT.md`. Items are tightly scoped — each should fit in one PR. Acceptance criteria are testable.

## P0 — Fix Before More Feature Work

### P0-1: Add `migrate` to focusStore, learningStore, ideaStore
**Why it matters:** `projectStore` is the only persisted store with a real migration path. The other three carry `version: 1` (or 2) with no `migrate`, so any schema bump silently merges old localStorage into the new shape. The `focusStore` shape has been touched 8 times since the project began — the next mutation that drops or renames a field will corrupt user state.
**Acceptance criteria:**
- `focusStore`, `learningStore`, `ideaStore` each have a `migrate` function in their persist config (no-op is acceptable as a forcing function).
- A unit test loads a v1 payload and asserts the migrate runs without throwing.
- `version` is bumped on the focus store (e.g. `2 → 3`) only after a migrate exists.
**Related files:** `src/state/focusStore.ts:323-355`, `src/state/learningStore.ts:97-101`, `src/state/ideaStore.ts:63-68`.

### P0-2: Hide or wire decorative nav and the "Inbox · 7" badge
**Why it matters:** "Focus Sessions", "Progress", and "Inbox · 7" in the Sidebar, plus "Focus" / "Progress" in the BottomBar and the disabled center "Quick Add" FAB, are clickable-looking elements that do nothing. They actively undermine trust in the rest of the app. The `7` badge is a hardcoded lie.
**Acceptance criteria:**
- Either remove all `path === null` items from `NAV_ITEMS` and the BottomBar, OR mark them visually as "coming soon" (greyed + tooltip) and remove the misleading badge count.
- The Quick Add FAB either does something useful (e.g. opens the Idea Parking Lot inline form) or is removed.
**Related files:** `src/data/navItems.ts`, `src/components/layout/Sidebar.tsx:73-95, 252-265`, `src/components/layout/BottomBar.tsx`.

### P0-3: Stop displaying streak counters that the app never increments
**Why it matters:** `focusStreakDays` and `projectStreakDays` are persisted state with setters but no codepath calls those setters. The sidebar's "Current Streaks" card renders `0` for any honest user. This is a visible product lie.
**Acceptance criteria:** Either compute streaks from `sessionLog` (group by local-day, count consecutive days with at least one session — see `useWeeklyStats` for date helpers), or hide the "Current Streaks" card until the logic exists.
**Related files:** `src/state/focusStore.ts:78-79, 235, 271-272`, `src/components/layout/Sidebar.tsx:212-249`.

## P1 — Complete Core Product Loop

### P1-1: Switch `focusStore.project` from name string to projectId-only
**Why it matters:** Every `CompletedSession` and the `dailyPlan` carry a denormalized project name string. As soon as a user renames or deletes a project, the historical log orphans to a stale name. Cheap to fix today; expensive once `sessionLog` has months of real data.
**Acceptance criteria:**
- Remove the `project: string` field from `FocusState` (or keep it transient, derived).
- Add a `useFocusProjectName()` hook (or selector) that resolves the active project name from `useProjectStore` at read time.
- `CompletedSession` keeps `projectId` only (rename `project` → `projectName` if you need a snapshot, but only as an immutable historical label, not a primary key).
- All consumers (`PlanMyDayModal`, `MainContent`, `FocusSessionCard`, `SessionRow`, `ProjectSessionsPanel`) updated.
- Existing `focus-ladder.focus` data migrated by P0-1.
**Related files:** `src/state/focusStore.ts:24, 34-46, 70, 105-110, 146-169, 274-289`, all consumers.

### P1-2: Survive refresh mid-session
**Why it matters:** Today, refreshing while the timer is running silently resets it; refreshing while the reflection modal is open *loses the entire session* (it isn't appended to `sessionLog` until reflection is submitted/dismissed). Documented as intentional, but it's a hostile default.
**Acceptance criteria:**
- Either persist `pendingReflectionFor` so the modal reappears after refresh (and warn the user if the session is stale beyond a threshold), or write the session to `sessionLog` *immediately on completion* and let reflection edit it later.
- A beforeunload prompt fires only when `status === "running" || pendingReflectionFor != null`.
- Tests cover the survive-refresh path.
**Related files:** `src/state/focusStore.ts:241-264, 291-321, 343-353`, `src/components/dashboard/SessionReflectionModal.tsx`.

### P1-3: Show captured reflection data that's currently hidden
**Why it matters:** `SessionReflection.energyLevel` (1–5), `reflection` (free text), and `completedPlanned` (bool) are written to localStorage but invisible in Insights. The user types something and never sees it again — collection without payoff.
**Acceptance criteria:**
- `SessionRow` (Insights feed) shows the reflection text excerpt and both rating dots (focus + energy).
- A new "Avg energy" tile joins the existing "Avg focus" in `SummaryCards`.
- Optional: a "completed-planned rate" tile.
**Related files:** `src/components/insights/SessionRow.tsx`, `SummaryCards.tsx`, `src/state/useInsightsData.ts:225-244`.

### P1-4: Aggregate manual time entries into project totals
**Why it matters:** `LogManualTimeModal` writes to `Project.manualEntries` but neither the dashboard nor Insights nor the project detail's `weeklyMinutes` reflects them. The user logs an hour and the number doesn't move.
**Acceptance criteria:**
- `useProjectStats` adds the manual entries to `weekMinutes` / `monthMinutes` / `totalMinutes`.
- `Active Projects` panel weekly bar reflects the combined session+manual total.
- A test asserts `computeProjectStats` includes `manualEntries`.
**Related files:** `src/state/useProjectStats.ts`, `src/components/projects/LogManualTimeModal.tsx`, `src/components/dashboard/ActiveProjectsPanel.tsx`.

### P1-5: Allow editing tasks and links (not just add/toggle/remove)
**Why it matters:** Notes are full CRUD; tasks and links are add-only. A typo in a task title is forever.
**Acceptance criteria:**
- `addTask` is paired with an `updateTask(projectId, taskId, patch)` action; UI exposes inline rename + due-date edit.
- Same for `updateLink(projectId, linkId, patch)`.
- Keyboard support (Enter to save, Esc to cancel).
**Related files:** `src/state/projectStore.ts:122-160, 202-220`, `src/components/projects/detail/ProjectTasksPanel.tsx`, `ProjectLinksCard.tsx`.

### P1-6: Minimal Settings page (or modal)
**Why it matters:** "Alex" and "Keep climbing." are hardcoded. A user with a name other than Alex sees a wrong greeting forever.
**Acceptance criteria:**
- New `useSettingsStore` (or fields on `focusStore`) for `userName` and `tagline`, persisted.
- A Settings modal/page lets the user set both.
- `MainContent` greeting and `Sidebar.ProfileRow` read from the store.
- Greeting uses `time-of-day` (Morning/Afternoon/Evening) derived from `new Date().getHours()`.
**Related files:** `src/components/layout/MainContent.tsx:17`, `src/components/layout/Sidebar.tsx:252-265`.

## P2 — Improve UX and Polish

### P2-1: Cap or archive `sessionLog`
**Why it matters:** Unbounded growth of a localStorage-persisted array. At ~5k sessions, hydration measurably slows; at quota, the app breaks.
**Acceptance criteria:** Either cap `sessionLog` at the most recent N (e.g. 500) and offer a "view all" backed by a separate archive store, or implement a JSON export and a clear-history button.
**Related files:** `src/state/focusStore.ts:82, 291-321`.

### P2-2: Extract `useResetOnOpen` hook for modal form state
**Why it matters:** Three modals (`PlanMyDayModal`, `SessionReflectionModal`, `AddNoteModal`) implement the same `useEffect(() => { if (!open) return; setX(...); ... }, [open])` pattern, all triggering `react-hooks/set-state-in-effect`. The rule is downgraded for them; the cluster is the textbook case for a small custom hook.
**Acceptance criteria:** A single `useResetOnOpen(open, initial, deps)` hook in `src/hooks/`. The three modals refactored to use it. The ESLint rule downgrade in `eslint.config.js` is removed (or scoped to remaining call sites).
**Related files:** `src/components/dashboard/PlanMyDayModal.tsx:90-98`, `SessionReflectionModal.tsx:99-105`, `src/components/projects/detail/AddNoteModal.tsx:20-26`, `eslint.config.js:24-27`.

### P2-3: Consolidate duplicated date helpers
**Why it matters:** `startOfWeek`, `mondayIndex`, `startOfDay` are defined identically in three hook files (`useWeeklyStats.ts`, `useInsightsData.ts`, `useProjectStats.ts`). Drift risk.
**Acceptance criteria:** Helpers moved to `src/utils/dateUtils.ts` (or extend `src/utils/date.ts`); the three hooks import from one place; tests still pass.
**Related files:** as above + `src/utils/date.ts`.

### P2-4: Promote an Idea → Project
**Why it matters:** The Idea Parking Lot is a sticky-note pad with no exit. The mockup story implies promotion.
**Acceptance criteria:** A "Promote to project" action on each idea opens `ProjectFormModal` pre-filled with the idea text as the project name; on submit, the idea is removed from the parking lot.
**Related files:** `src/components/dashboard/IdeaParkingLot.tsx`, `src/components/projects/ProjectFormModal.tsx`, `src/state/ideaStore.ts`.

### P2-5: Editable / deletable session log entries
**Why it matters:** Sessions are append-only. Mistakes are permanent.
**Acceptance criteria:** A session row supports Edit (re-open reflection) and Delete (with confirm). Store gains `updateSessionReflection(sessionId, patch)` and `removeSession(sessionId)`.
**Related files:** `src/components/insights/SessionRow.tsx`, `src/state/focusStore.ts`.

### P2-6: Export / Import data
**Why it matters:** No backup path; localStorage corruption or browser switch = total loss.
**Acceptance criteria:** A button on Settings (or Insights) downloads a JSON dump of all four stores. An Import button loads JSON, validates shape, and replaces or merges (user choice).
**Related files:** new `src/utils/dataIO.ts`, hook into a Settings page.

### P2-7: Make right-panel rendering consistent across pages
**Why it matters:** `/today` uses `RightPanel` mounted by `AppShell`; other routes render their own `<aside>` inside the page component. Behavior at `lg`/`xl` breakpoints is slightly different and the AppShell grid sizes are duplicated in CSS in two places.
**Acceptance criteria:** Either move all asides into AppShell-mounted route-aware right panels, or remove the AppShell right column and let each page own its layout.
**Related files:** `src/components/layout/AppShell.tsx`, `RightPanel.tsx`, all four page components.

### P2-8: Real (or honest) focus-mode flags
**Why it matters:** Three booleans labeled "Notifications Muted", "Distractions Blocked", "Focus Mode On" are toggled by the user but the app does nothing with them.
**Acceptance criteria:** Either wire them to the Notification API / `document.title` blinker / a real distraction-blocker UI, or relabel them as session-tagging metadata that *is* visible somewhere meaningful.
**Related files:** `src/components/dashboard/FocusSessionCard.tsx:170-194`, `src/state/focusStore.ts:228-232`.

## P3 — Later / Advanced

- **P3-1**: Multi-path Learning Path (custom paths, import/export, mark-subtopic-complete UI).
- **P3-2**: Session tagging UI + tag filter on Insights (`CompletedSession.tags` is auto-populated; let users edit + filter).
- **P3-3**: Theme toggle (currently dark-only via `<html class="dark">`).
- **P3-4**: Real Notion sync behind the placeholder card.
- **P3-5**: Multi-device sync via a backend (auth, server-side persistence, conflict resolution).
- **P3-6**: Component-level test coverage (currently 0 — all 32 tests are in `src/state/`). At minimum, add RTL tests for the modals that drive store mutations.
- **P3-7**: Route-level code splitting. The build is one 377 KB chunk; lazy-loading `/learning` and `/insights` would meaningfully reduce TTI.
- **P3-8**: Add a `.github/workflows/ci.yml` running `lint + typecheck + test + build` on every push. There is no CI today.
- **P3-9**: Add `engines` to `package.json` to pin Node version.
