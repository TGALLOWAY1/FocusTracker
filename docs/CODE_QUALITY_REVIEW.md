# Code Quality Review

## Overall Assessment

**Grade: B+ for an MVP front-end.** The codebase is small (≈25 TS/TSX files), readable end-to-end in under an hour, and has thoughtful separation between stores, demo data, primitives, and feature components. TypeScript is strict and clean (`tsc -b` passes with no errors). Zustand stores are well-factored, with hydration-safe `merge` and partialized persistence. The biggest gaps are *under-engineering* in two specific places (stats not derived from session log; projects not interactive) and a few decorative buttons left as placeholders — not architectural rot.

This is a comfortable foundation to build on. No rewrite needed.

## What Is Well Built

- **Zustand stores are clean and decoupled.** Three single-purpose stores; each persists exactly what it should (`focusStore.ts:211-222`, `ideaStore.ts:62-67`, `projectStore.ts:28-32`). No cross-store imports of internals.
- **Hydration is correct.** `focusStore.merge` (`focusStore.ts:226-236`) intentionally resets `status`, `remainingSec`, and `pendingReflectionFor`. Refresh in the middle of a session does the right thing.
- **Timer math is right.** `tick()` checks the completion threshold *before* decrementing (`focusStore.ts:151`), so the display never shows `-1`. `buildCompletion` clamps `elapsed` to `Math.max(0, …)` (`focusStore.ts:88`).
- **Modal a11y.** `Modal.tsx` uses a portal, `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape to close, backdrop-click to close, and prevents body scroll. Each rating button in `SessionReflectionModal` has `aria-label="Rate N of 5"` (`SessionReflectionModal.tsx:26`). The weekly bar chart has a real summary `aria-label` (`FocusStatsPanel.tsx:50-55`).
- **TS strictness pulled in early.** `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` in `tsconfig.app.json`. No `// @ts-ignore`, no `any` in product code.
- **Small components.** Largest files (`Sidebar.tsx`, `FocusSessionCard.tsx`) hover around 250–320 lines and decompose into small named pieces (`NavList`, `FocusTierCard`, `StreaksCard`, `CircularTimer`, `SunsetBackdrop`, `FlagsStrip`).
- **Shared primitives.** `Card`, `CardHeader`, `Modal`, `ProgressRing` in `src/components/ui/` are reused across panels.
- **Utility shape is right.** `src/utils/{time.ts,date.ts,id.ts}` are tiny and named for what they do.

## Risks

1. **`focusStore.project` is a name string, not an id.** If a user renames "Harmonia EP", the `dailyPlan.projectName`, the active session, and every entry in `sessionLog` orphan to a name that no longer exists. Cheap to fix today, expensive once `sessionLog` has real data. (`focusStore.ts:50, 24-32, 167-180`.)
2. **No persist schema migration.** All three stores set `version: 1` but no `migrate` function. Any change to the persisted shape will silently merge old data into a new shape and either crash or display stale fields.
3. **No automated tests.** Timer logic, `tick()` completion, `setDailyPlan` overwrite behavior, and the reflection log are all logic-heavy and untested. Step 7 adds 1-2 smoke tests as a starter, but full coverage of `focusStore` is recommended.
4. **No lint.** `tsc` is strict but doesn't catch React-specific issues (missing dep arrays, key warnings, accessibility). One `// eslint-disable-next-line` already in code (`PlanMyDayModal.tsx:97`) suggests the team has used ESLint elsewhere; adding it back is cheap.
5. **`focusStore` initial `status: "running"`** (`focusStore.ts:117`) is misleading. It works only because `merge` forces `idle`. A future change that adds, say, a fresh-install flow that bypasses `merge` would ship with a timer counting down on first paint. Flip the default to `"idle"`.

## Code Smells

- **Hardcoded user data.** `"Alex"` appears in `MainContent.tsx:17` and `Sidebar.tsx:233`; `"Keep climbing."` in `Sidebar.tsx:234`. Tier id seeded at 3 with 1250 XP and streaks at 14/7 (`focusStore.ts:128-131`). These are demo defaults — fine for a screenshot, brittle for a real user. Pull into a `defaults.ts` or a settings store.
- **Decorative buttons.** "View All" (`FocusLadderPanel.tsx:122-127`), "Manage" (`ActiveProjectsPanel.tsx:60`), the disabled Quick Add FAB (`BottomBar.tsx:48-56`), and seven nav items in Sidebar + BottomBar all render as clickable-looking elements with no handler. Either remove them or wire them — never both.
- **Magic numbers in `CircularTimer`.** `size = 280, stroke = 5` (`FocusSessionCard.tsx:98-99`). Not parameterized; not responsive. Fine but worth a tiny refactor when responsiveness matters.
- **Inline `<style>` keyframes via `style` jsx.** `Modal.tsx` defines `modalFade` and `modalPop` keyframes — actually wait, those are referenced via Tailwind `animate-[…]` classes; let me double-check. (The keyframes live in `tailwind.config.ts` or `index.css` — verified safe.) Not a smell after all.
- **`SunsetBackdrop` is 65 lines of inline SVG.** Acceptable, but a single SVG file imported as a component or asset would be cleaner. Low priority.
- **Bottom bar's `ACTIVE` constant is duplicated.** `BottomBar.tsx:20` defines its own `const ACTIVE = "today"` while `navItems.ts:29` exports `ACTIVE_NAV_ID`. Pick one.
- **`Sidebar` imports `WEEK_STATS`** to compute deep-work hours (`Sidebar.tsx:189`). This couples layout to demo data; once stats become live, this becomes a derived value off `sessionLog`.

## Over-Engineering

None significant for the current scope. The Zustand setup is appropriate — `useReducer` would be heavier; Redux is way too much. `persist` is the right tool. The custom `merge` is necessary, not gratuitous.

## Under-Engineering

- **`FocusStatsPanel` reads `WEEK_STATS` instead of `sessionLog`.** This is the single biggest functional gap. Once a user completes a real session, nothing in the right column moves. Trivial selector to compute weekly totals from `focusStore.sessionLog`.
- **`ActiveProjectsPanel` cards aren't clickable.** Either preload the focus session with the clicked project or expand to a detail view. Currently the project list is a read-only display.
- **Tier doesn't auto-advance with XP.** `currentTierId` is a setter (`focusStore.ts:162`) but nothing increments it. A user who completes enough sessions stays on Tier 3 forever.
- **`sessionLog` is never displayed.** Sessions and reflections accumulate in `focusStore.sessionLog` (`focusStore.ts:188`) but no UI surfaces them. Useful insight is being collected and hidden.
- **No way to edit projects, streaks, name, or tiers** from the UI. The stores have `upsertProject` / `setProjects` etc. but no form.

## Recommended Refactors

Ordered cheap → expensive.

1. **Default `status` to `"idle"`.** `focusStore.ts:117`. One word.
2. **De-dupe the active-nav constant.** Delete `BottomBar.tsx:20`, import `ACTIVE_NAV_ID` from `navItems.ts`.
3. **Swap Project Streak icon** from `Target` → `Zap` (`Sidebar.tsx:209`) to match the mockup.
4. **Wire `FocusStatsPanel` data prop from `sessionLog`.** Add a memoized selector in `RightPanel.tsx` (or a `useWeeklyStats` hook in `src/state/`) that buckets the last 7 days from `sessionLog`. Keep `WEEK_STATS` as the fallback / empty-state.
5. **Make project cards clickable.** Add `onClick` to `ProjectRow` in `ActiveProjectsPanel.tsx:17` that calls `setDailyPlan` (or a lighter "set project" action) and scrolls focus to the timer.
6. **Extract `useCountdown` hook** from `FocusSessionCard.tsx:308-312`. Currently inlined, but as soon as a second timer-driven UI exists (e.g. break timer), this needs to be shared.
7. **Switch `focusStore.project` to `projectId`** with a derived display name. Add a tiny `getProjectName(id)` helper in `projectStore`. Update `setDailyPlan` and `SessionReflectionModal`. Required before persisting real long-term history.
8. **Add a `migrate` function** to each `persist` config when `version` is next bumped. Even a no-op migrate at v1 is a forcing function.

## Do Not Refactor Yet

- The three-column grid in `AppShell.tsx`. It works, it's responsive, it matches the mockup.
- The Tailwind color tokens. The custom palette is consistent and named well; don't churn it.
- Component-level state (`useState` for `adding` in idea form, for `planOpen` in main content). Don't promote to stores — that would be over-engineering.
- The `SunsetBackdrop` SVG. The mockup is more photographic but the SVG is performant, scales, and reads correctly.
- The 6 fixed tiers. The product hasn't decided whether tiers should be customizable; don't generalize until it does.
