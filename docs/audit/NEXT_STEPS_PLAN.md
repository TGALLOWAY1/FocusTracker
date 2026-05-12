# Next Steps Plan

## Recommended Direction

Hold the line on new pages. The four routes that exist (`/today`, `/projects`, `/projects/:id`, `/learning`, `/insights`) cover the product story — what's missing is *credibility*: the streak that doesn't move, the "Inbox · 7" badge that's a hardcoded lie, the refresh that loses your session, the reflection text you can never read again, the project rename that orphans your history. Three short slices fix the worst of these and unblock long-term data evolution. Each is one PR. None requires new architecture.

## Next 3 Implementation Slices

### Slice 1 — Stop lying to the user

- **Goal:** Remove every UI element that displays state the app cannot update or that does nothing when clicked. Replace the streak counter with a real one derived from `sessionLog`. (Backlog P0-2, P0-3.)
- **Why now:** The first-impression cost is high — these are visible from the dashboard before the user has done anything. They're cheap to fix and the fix is irreversible-for-the-better.
- **Files likely touched:**
  - `src/data/navItems.ts` (drop `path: null` items or mark coming-soon).
  - `src/components/layout/Sidebar.tsx:73-95` (decorative nav rendering), `212-249` (StreaksCard).
  - `src/components/layout/BottomBar.tsx` (BottomItem placeholders, Quick Add FAB).
  - `src/state/focusStore.ts` — add a derived `useStreaks()` hook (or compute in `useWeeklyStats`-style file) that reads `sessionLog`, groups by local-day, and counts trailing consecutive days.
  - New `src/state/useStreaks.ts` + `useStreaks.test.ts`.
- **Acceptance criteria:**
  - No nav item with `path === null` is rendered as clickable; the "Inbox · 7" badge is gone.
  - "Current Streaks" card shows a value that updates after a real session is logged. A unit test seeds a `sessionLog` with sessions on consecutive local-days and asserts the computed `focusStreakDays`.
  - The Quick Add FAB either opens the Idea Parking Lot inline form or is removed.
  - `npm run lint && npm run typecheck && npm test && npm run build` all pass.
- **Risks:** Streak computation must respect local timezone (cross-midnight, DST). Cover with tests using fixed `Date` injections. The Quick Add FAB choice is a small UX call — favor "removes for now" over "wires to a half-baked surface".

### Slice 2 — Survive a refresh, show what we capture

- **Goal:** Two related fixes: (a) refreshing mid-session no longer loses the session — the in-progress reflection (or the just-completed session) is recoverable on reload, and (b) the reflection data we already collect (`energyLevel`, free-text reflection, `completedPlanned`) becomes visible in Insights. (Backlog P1-2, P1-3.)
- **Why now:** Together these turn the reflection flow from "I typed something into a void" into "I can see what I wrote last week" — the single biggest "is this product real" moment.
- **Files likely touched:**
  - `src/state/focusStore.ts` — change persist `partialize` to include `pendingReflectionFor` *or* write the session to `sessionLog` immediately on completion (with a `reflection: null` placeholder updatable later); update `merge` accordingly. Add `migrate` (Backlog P0-1) so the new persisted shape is safe.
  - `src/state/focusStore.test.ts` — extend tests for the new persistence behavior.
  - `src/components/dashboard/SessionReflectionModal.tsx` — handle "session already in log, update reflection in place" path.
  - `src/components/insights/SessionRow.tsx` — render `reflection.energyLevel` (second dot row) and a 2-line excerpt of `reflection.reflection`. Display `completedPlanned` as a badge.
  - `src/components/insights/SummaryCards.tsx` + `src/state/useInsightsData.ts` — add `avgEnergyRating` and (optional) `completedPlannedRate` to `InsightsSummary`.
- **Acceptance criteria:**
  - After a completed session + page refresh: either the reflection modal is re-presented with the original session attached, or the session appears in `sessionLog` and the user can open it to add reflection later.
  - Insights row shows both focus and energy ratings + reflection excerpt where present.
  - `useInsightsData.test.ts` extended for the new summary fields.
  - `focusStore` persist `version` bumped, with a `migrate` that maps existing v2 data forward.
- **Risks:** Persisting `pendingReflectionFor` reintroduces the "stale modal pops back" UX risk that the current `merge` was designed to prevent; mitigate with an "older than 24h?" stale check. Bumping the focus store version without a migrate is a footgun — do not separate these.

### Slice 3 — Project history that survives a rename

- **Goal:** Stop carrying the project *name* as the source of truth in `focusStore`. Switch every consumer to `projectId`, derive the display name at read time, and snapshot a historical `projectName` on `CompletedSession` only as a label (not a key). (Backlog P1-1.)
- **Why now:** Cheap today, expensive once users have months of session log. Renaming a project should not break the past.
- **Files likely touched:**
  - `src/state/focusStore.ts:24, 34-46, 70, 105-110, 146-169, 274-289` — drop `project: string` from the runtime state, keep `projectId` as the only key. `CompletedSession` keeps both `projectId` and `projectName` — but `projectName` is now an immutable historical snapshot, never used to look up the project.
  - `src/state/focusStore.test.ts` — extend for the new shape.
  - `src/state/useFocusProjectName.ts` (new) — selector that resolves `projectId` → name via `useProjectStore`.
  - All consumers: `MainContent.tsx`, `FocusSessionCard.tsx`, `PlanMyDayModal.tsx`, `SessionReflectionModal.tsx`, `SessionRow.tsx`, `ProjectSessionsPanel.tsx` — replace `focusStore.project` with the derived name; `setActiveProject` keeps its current `{ id, name }` shape but stores only the id.
  - `migrate` in `focusStore` translates v2 records (with a stale `project` field) to the new shape.
- **Acceptance criteria:**
  - Renaming a project in `ProjectFormModal` updates the dashboard's active-session label live (no stale name).
  - Existing session log entries show whatever name was current at the time of logging — by reading `session.projectName` (snapshot), not by lookup.
  - All four `npm` checks pass.
- **Risks:** This touches a lot of files. Stage it carefully: store + tests first, then consumers route by route, with the linter/typechecker as the safety net (`projectStore` lookup returning `undefined` becomes a typed error rather than a silent UI bug).

## What Not To Build Yet

- **A new page or route.** The product already has more routes than complete loops. Adding a "Goals" page or "Calendar" page makes the existing emptiness more visible, not less.
- **A backend / auth / multi-device sync.** Premature for a single-user MVP.
- **Custom learning paths.** The hardcoded ML path is fine until other gaps are closed.
- **Real OS-level focus-mode integration.** Browsers can't actually mute notifications; faking it adds risk for no payoff. Either drop the labels or relabel them as session metadata.
- **A charting library swap.** The hand-rolled SVG donut, trend, and progress charts are working. Don't pull in `recharts` until accessibility or a third chart shape forces the issue.
- **A `useCountdown` hook.** Only one timer exists. Don't generalize until a second one (e.g. break timer) appears.

## Definition of Done for Next Milestone

The next milestone is **"a returning beta user trusts the app after one week of use."** Concretely, that means:

- All P0 items are shipped.
- Slices 1–3 above are merged.
- `npm run lint && npm run typecheck && npm test && npm run build` pass on every PR (a CI workflow under `.github/workflows/ci.yml` would enforce this — see Backlog P3-8).
- `docs/audit/MANUAL_QA_CHECKLIST.md` has been re-walked in a real browser; every **NT-NB** row is replaced with **Pass** or **Fail**.
- A short `CHANGELOG.md` (or release notes in `docs/`) documents what changed in this milestone — Phase B's PRs don't have a single human-readable summary today.
