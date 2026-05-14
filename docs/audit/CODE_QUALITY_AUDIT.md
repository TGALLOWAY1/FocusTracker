# Code Quality Audit

## Overall Assessment

**Grade: B+**

The FocusTracker codebase is well-structured with clean separation of concerns: Zustand stores are properly factored with correct hydration logic, 583 lines of focused test coverage (4 suites, 32 tests) verify core state mutations and derived hooks, and new component layers (insights, projects detail, learning path) follow established patterns. TypeScript strict mode and ESLint are configured correctly. The main quality gaps are concentrated in three areas: (1) the string-based project name storage in `focusStore` that orphans long-term session history on project rename, (2) modal form-reset patterns tripping `react-hooks/set-state-in-effect` warnings (intentionally downgraded), and (3) hardcoded demo user data ("Alex") and decorative placeholder buttons scattered across layout components. No architectural rot; all gaps are fixable refactors at reasonable cost.

## What Is Well Built

- **Zustand hydration discipline.** `focusStore.merge()` (lines 343–353) intentionally resets `status`, `remainingSec`, and `pendingReflectionFor` on page reload, so a refresh mid-session doesn't resume stale timers. `projectStore` includes a working v1→v3 migration function that safely evolves the schema. Pattern is safe and forward-compatible. (`src/state/focusStore.ts:343-353`, `src/state/projectStore.ts:226-235`)

- **Derived stats hooks are pure and testable.** `useWeeklyStats()`, `useInsightsData()`, and `useProjectStats()` all wrap pure computation functions (`bucketWeeklyStats`, `computeInsights`, `computeProjectStats`) that take plain objects and return deterministic results. Tests verify they handle edge cases (empty logs, date boundaries, month/week/all ranges). (`src/state/useWeeklyStats.ts:26-68`, `src/state/useInsightsData.ts:247-265`, `src/state/useProjectStats.ts:43-86` + 4 test suites with 32 tests total)

- **Modal a11y is complete.** All modals use the shared `Modal.tsx` primitive which provides `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape-to-close, backdrop-click, and body-scroll prevention. Form inputs in `SessionReflectionModal` have proper `aria-label` for rating buttons (line 26). SVG charts include semantic `aria-label` and `role="img"`. (`src/components/ui/Modal.tsx`, `src/components/dashboard/SessionReflectionModal.tsx:26`)

- **Chart math is rigorous.** `ProjectProgressChart` (lines 107–225) correctly calculates cumulative progress with explicit padding, viewBox scaling, and responsive SVG. `CategoryDonut` (lines 22–81) uses circle stroke-dasharray to avoid path string computation and includes center label rendering. Both handle empty states gracefully. (`src/components/projects/detail/ProjectProgressChart.tsx:107-225`, `src/components/insights/CategoryDonut.tsx:15-111`)

- **Partialized persistence protects transient state.** Each store's `persist` config uses `partialize` to exclude runtime-only fields: `focusStore` drops `status`, `remainingSec`, `pendingReflectionFor`; `ideaStore` and `learningStore` are minimal. No unnecessary rehydration bloat. (`src/state/focusStore.ts:327-339`, `src/state/ideaStore.ts:62-67`, `src/state/learningStore.ts:96-102`)

- **Test coverage covers critical logic.** 163 lines in `focusStore.test.ts` verify `tick()` to completion, XP awards with deep-work multipliers, tier ladder advancement, and reflection submission. 235 lines in `useInsightsData.test.ts` exercise date-range bucketing, filters, and category summaries. No UI tests (acceptable for MVP), but domain logic is solid. (`src/state/focusStore.test.ts`, `src/state/useInsightsData.test.ts`)

- **Project store is well-refactored.** The migration from v2 to v3 demonstrates forward-thinking: legacy projects lacking tasks/notes/links/events get defaults, new projects have full structure. `appendEvent` caps event history at 50 with a FIFO ring buffer. Mutate helpers are pure: `mutateProject` clones the array and updates `updatedAt`. (`src/state/projectStore.ts:46-104`)

## Biggest Risks

1. **focusStore.project is a name string, not a project ID.** When a user renames "Harmonia EP" in the project, every session in `sessionLog` and `dailyPlan.projectName` points to a stale name. Lookups like `projects.find((p) => p.name === storeProject)` (PlanMyDayModal:79) will fail silently. Currently recoverable because seed data is stable, but dangerous once real rename history accumulates. Fix: migrate to `projectId` + derive display name via `useProjectStore`. Risk level: HIGH (blocks multi-month session history). (`src/state/focusStore.ts:24, 70, 267, 280`, `src/components/dashboard/PlanMyDayModal.tsx:79`)

2. **sessionLog is unbounded and persisted.** Every session since app install accumulates in `focusStore.sessionLog`, serialized to localStorage on every `submitReflection`. No cleanup, no archiving, no pagination. At 100 sessions (~300 entries if each has reflection), localStorage is fine; at 10,000 sessions, serialization and deserialization will slow page load. No migration path if the schema ever changes. Fix: implement a rolling archive (move sessions older than 1 year to separate store or omit from persistence). Risk level: MEDIUM (performance cliff at ~5k sessions, acceptable for now). (`src/state/focusStore.ts:82, 327-339`)

3. **focusStore version is 2, but no migrate function exists.** v2 added `dailyPlan`, v3+ might add fields. If persisted state from v2 is loaded against a v3+ store that expects new fields, unpopulated fields default to `null`/`undefined`, breaking downstream code. `projectStore` has a working `migrate` function (lines 226–235); `focusStore` does not. Fix: add `migrate: (persisted, fromVersion) => { ... }` even if it's a no-op at v2. Risk level: MEDIUM-HIGH (blocks safe schema evolution). (`src/state/focusStore.ts:323-325`)

4. **PlanMyDayModal, SessionReflectionModal, AddNoteModal all reset form state in a useEffect.** Three separate components trip the same `react-hooks/set-state-in-effect` warning because they synchronize component state from store/prop state in an effect. ESLint is downgraded to `warn` (eslint.config.js:26), but the pattern is brittle: rapid prop changes can cascade re-renders. Fix: extract a reusable `useResetOnOpen(open, initialState)` hook. Risk level: LOW (linter-flagged but not broken; low-priority refactor). (`src/components/dashboard/PlanMyDayModal.tsx:90-98`, `src/components/dashboard/SessionReflectionModal.tsx:99-105`, `src/components/projects/detail/AddNoteModal.tsx:20-26`)

5. **Project type has optional fields (tasks?, notes?, links?, events?) but code assumes they exist.** Every component accesses these as `project.tasks ?? []` to handle undefined, which is safe. However, the Project type definition mixes required and optional fields, making it ambiguous whether these fields are always populated or truly optional. `projectStore.upsertProject` (line 111) always populates them via migration, so in practice they're required. Fix: remove the `?` from the type or add a runtime assertion that they exist after migration. Risk level: LOW (defensive code works, but type contract is confusing). (`src/data/projects.ts:166-169`, `src/state/projectStore.ts:57-77`)

## Code Smells

- **Hardcoded user name "Alex" and tagline.** "Good morning, Alex." appears in `MainContent.tsx:17` and "Keep climbing." in `Sidebar.tsx:260`. These are demo defaults, but they should live in a `src/data/defaults.ts` or a settings store so they can be replaced with real user names without code changes. (`src/components/layout/MainContent.tsx:17`, `src/components/layout/Sidebar.tsx:260`)

- **Decorative buttons and placeholder nav items.** BottomBar renders 6 nav items but 3 have `path: null` (Focus Sessions, Progress). Sidebar and BottomBar both repeat placeholder items. None have click handlers. Either remove them or wire them. The `PlanMyDayModal`, `ProjectFormModal`, and `SessionReflectionModal` all have the same form-reset pattern that trips ESLint: a conditional useEffect that resets multiple pieces of state synchronously (lines 90–98, 99–105, 20–26). This is safe but signals an opportunity to extract a `useResetOnOpen` hook.

- **Magic numbers in chart layouts.** `CircularTimer` hard-codes `size = 280, stroke = 5` (FocusSessionCard.tsx:98-99). `ProjectProgressChart` uses `W = 600, H = 200, PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 28` (ProjectProgressChart.tsx:107-112). `StayConsistentPanel` and `FocusStatsPanel` embed padding and dimensions inline. None are responsive; fine for fixed layouts, but difficult to refactor if design changes. (`src/components/dashboard/FocusSessionCard.tsx:98-99`, `src/components/projects/detail/ProjectProgressChart.tsx:107-112`)

- **Inline SVG components are large.** `SunsetBackdrop` (FocusSessionCard.tsx:25-89, 65 lines) defines a detailed mountain/sky gradient inline. `FocusLadderLogo` (Sidebar.tsx:11-30, 20 lines) renders a gradient ladder. Both are readable but could be extracted to `.svg` files or a dedicated `src/components/illustrations/` folder for reuse and maintainability. (`src/components/dashboard/FocusSessionCard.tsx:25-89`, `src/components/layout/Sidebar.tsx:11-30`)

- **Category color/label lookups are data-driven.** `ACTIVITY_CATEGORIES` maps activity types to hex colors, Tailwind classes, and labels. This is the right pattern: data is centralized (activityCategories.ts). However, some components inline arbitrary color strings (e.g., `#1F2638` for grid lines in ProjectProgressChart:187, `#6B7390` for text), which creates a secondary source of truth. Not a major issue, but inconsistent with the category-driven approach. (`src/data/activityCategories.ts`, `src/components/projects/detail/ProjectProgressChart.tsx:187, 195`)

## Duplicated Logic

- **Modal form-reset pattern appears 3 times.** PlanMyDayModal, SessionReflectionModal, and AddNoteModal all implement the same pattern: `useEffect(() => { if (!open) return; setState(...); }, [open])`. This is safe (dependency array is correct) but verbose. Extract to a `useResetOnOpen` hook that takes initial values and returns a reset function. (`src/components/dashboard/PlanMyDayModal.tsx:90-98`, `src/components/dashboard/SessionReflectionModal.tsx:99-105`, `src/components/projects/detail/AddNoteModal.tsx:20-26`)

- **Date/week calculation appears in 3 hooks.** `startOfWeek`, `mondayIndex`, and `startOfDay` are defined independently in `useWeeklyStats.ts` (lines 7-21), `useInsightsData.ts` (lines 67-88), and `useProjectStats.ts` (lines 16-37), with identical implementations. Extract to a shared `src/utils/dateUtils.ts`. (`src/state/useWeeklyStats.ts:7-21`, `src/state/useInsightsData.ts:67-88`, `src/state/useProjectStats.ts:16-37`)

- **Category lookup and display.** Many components import and use `ACTIVITY_CATEGORIES[category]` to fetch color, label, and class (CategoryDonut:1-65, ProjectDetailPage:17-60, SessionRow:4-62, CategoryTrendPanel:3-24). This is correct centralization, but no deduplicated helpers exist to format category chips or fetch metadata. Consider a `categoryMeta(c: ActivityCategory)` helper (which exists in useInsightsData.ts:276 but is not exported). Make it a utility in `src/utils/` and import everywhere.

## Dead or Unused Code

- **focusStats.ts is imported but not used.** `FocusStatsData` type is imported in `FocusStatsPanel.tsx` (line 2) and `useWeeklyStats.ts` (line 2) but `FocusStatsPanel` now uses demo data, not derived stats. The type is still useful (defines the shape for stats), but the file's original purpose (seed stats) is obsolete. The file should be retained as a type definition, but the demo data can be removed or archived. (`src/data/focusStats.ts`)

- **"Alex" is a global literal.** Hardcoded in MainContent.tsx:17 and Sidebar.tsx:260. No constant definition, no settings hook, no prop. This should be pulled into a user object or settings store.

- **Placeholder nav items with path: null.** BottomBar.tsx and navItems.ts define several nav items with `path: null` (Focus Sessions, Progress, Inbox). These render as disabled buttons. Either remove them or wire routes. They're not dead code (they render), but they're nonfunctional placeholders that clutter the nav.

## Fake / Nonfunctional Interactions

- **Navigation placeholders.** The bottom bar includes "Focus Sessions" and "Progress" with `path: null`. Clicking them does nothing. The sidebar includes an "Inbox" badge (7 items, hardcoded). These are intentional placeholders per the `CODE_QUALITY_REVIEW.md` baseline (decorative buttons), so acceptable.

- **Disabled/placeholder buttons.** PlanMyDayModal, FocusSessionCard, ProjectFormModal all have primary CTA buttons that are wired and functional. However, several panels have "View All" (FocusLadderPanel:122-127 from baseline review) and "Manage" buttons that don't navigate. This is acceptable for an MVP but worth documenting as future scope.

- **"Quick Add" FAB in BottomBar.** No handler; renders as a visual placeholder. This is documented as intentional.

## Type Safety Issues

- **Optional Project fields with implicit non-null usage.** `Project` type marks `tasks?`, `notes?`, `links?`, `events?` as optional (projects.ts:166-169), but every component accesses them as `project.tasks ?? []`. This is safe (defensive code works) but creates a type contract mismatch: are these fields always populated by the store, or truly optional? `projectStore.upsertProject` always populates them via migration (projectStore.ts:57-77), so in practice they're required. Fix: either remove the `?` from the type or add a runtime check in migration to assert they exist. Risk level: LOW (code is defensive, but type clarity would help future contributors). (`src/data/projects.ts:166-169`)

- **No type narrowing on focusStore.project.** The store holds `project: string` (a name, not an ID). Components use this string directly (FocusSessionCard:228, MainContent:210) but the type doesn't distinguish "project name" from an arbitrary string. If a project is deleted and the name no longer exists, no type error flags this. Using `projectId: string` and deriving the name would be safer. (`src/state/focusStore.ts:70`)

- **focusStore version is 2, no migrate function.** If version is bumped to 3+, persisted v2 data will silently merge with v3 store, leaving any new required fields undefined. `projectStore` has a working migrate function; `focusStore` does not. Add one even if it's initially a no-op. (`src/state/focusStore.ts:325`)

## State Management Issues

- **Cross-store coupling in PlanMyDayModal.** The modal reads both `useFocusStore` (project, task, duration) and `useProjectStore` (projects list) to map stored project name to ID and pre-populate the form. This is reasonable, but it means `focusStore.project` (a name string) is the source of truth for the active project. Switching to `focusStore.projectId` would eliminate the string lookup and clarify the dependency. (`src/components/dashboard/PlanMyDayModal.tsx:72-80`)

- **Selector granularity is reasonable but could be more selective.** Most components subscribe to individual fields via selectors like `useFocusStore((s) => s.project)`, which is fine. However, `ProjectDetailPage` reads `useFocusStore((s) => s.sessionLog)` in a useMemo (line 67) to compute focus breakdown, then passes it as a prop to sub-components. This works but creates a dependency on all 582+ lines of session history. A more granular selector like `useProjectSessionLog(projectId)` would be better. Not urgent (performance is fine), but a future improvement. (`src/components/projects/detail/ProjectDetailPage.tsx:67-100`)

- **No selectors to prevent re-renders from unrelated state changes.** If a component reads `focusStore((s) => s.sessionLog)` and also `focusStore((s) => s.status)`, a `pause()` action updates `status` but doesn't change `sessionLog`, yet the component re-renders anyway if it reads both. Consider using `useShallow` from Zustand for object selectors, though current usage is mostly primitive fields (strings, numbers), so this is a minor optimization. (`src/state/focusStore.ts` and all components using it)

## Persistence Issues

**Brief note:** See `docs/audit/PERSISTENCE_AUDIT.md` for comprehensive analysis. Key code-quality implications:

- **No schema migration for focusStore.** Unlike `projectStore` (which has a working `migrate` function at line 226), `focusStore` sets `version: 2` (line 325) but includes no `migrate` function. If version is bumped to 3, persisted v2 state will merge unsafely. (`src/state/focusStore.ts:323-325`)

- **sessionLog unbounded in localStorage.** Every session persists in full. At scale (5k+ sessions over a year), this balloons the persisted state and slows hydration. No archiving or cleanup mechanism exists. (`src/state/focusStore.ts:82, 327-339`)

## Styling Consistency Issues

- **Mix of Tailwind utilities and inline hex colors.** Category colors use hex in SVG charts (e.g., `#8B7CF6`, `#5FD68A`) because they're data-driven from `ACTIVITY_CATEGORIES`. Other grid/background colors are hardcoded (e.g., `#1F2638` for grid lines, `#6B7390` for labels). This is acceptable (chart colors must be dynamic), but a secondary palette of semantic hex values (e.g., `const CHART_COLORS = { gridLine: "#1F2638", label: "#6B7390" }`) would improve consistency. (`src/data/activityCategories.ts`, `src/components/projects/detail/ProjectProgressChart.tsx:187, 195`)

- **Rounded radius inconsistency.** Most components use `rounded-xl` (Tailwind), but some hardcode `rounded-lg`, `rounded-2xl`. Button styles mix `px-3 py-2` and `px-4 py-2.5` inconsistently across BottomItem, ProjectPill, and other components. Not a major issue (visual design is cohesive), but opportunity for a shared button variant library. (`src/components/layout/BottomBar.tsx:28-32`, `src/components/dashboard/PlanMyDayModal.tsx:54-68`)

- **SVG stroke widths and opacity values are hardcoded.** `CircularTimer` uses `strokeWidth={stroke}` (line 117), but stroke is a local const. `ProjectProgressChart` defines stroke colors directly in SVG (line 187: `stroke="#1F2638"`). Extracting theme tokens for these would reduce magic numbers. (`src/components/dashboard/FocusSessionCard.tsx:97-150`, `src/components/projects/detail/ProjectProgressChart.tsx:107-225`)

## Recommended Refactors

Ordered cheap → expensive.

1. **Extract date/week calculation helpers to shared utility.** `startOfWeek`, `mondayIndex`, `startOfDay` are defined identically in three places. Create `src/utils/dateUtils.ts`, export them once, and import in `useWeeklyStats`, `useInsightsData`, `useProjectStats`. Cost: 15 minutes, high impact (eliminates duplication, improves maintainability). (`src/state/useWeeklyStats.ts:7-21`, `src/state/useInsightsData.ts:67-88`, `src/state/useProjectStats.ts:16-37`)

2. **Pull hardcoded user name and tagline into a constants file.** Create `src/data/defaults.ts` with `DEMO_USER_NAME = "Alex"` and `DEMO_TAGLINE = "Keep climbing."`, import and use in `MainContent.tsx:17` and `Sidebar.tsx:260`. Future-proofs for user settings. Cost: 5 minutes. (`src/components/layout/MainContent.tsx:17`, `src/components/layout/Sidebar.tsx:260`)

3. **Export categoryMeta helper from utils.** `useInsightsData.ts` defines `categoryMeta(c: ActivityCategory)` (line 276) but doesn't export it. Move to `src/utils/` and re-export from `activityCategories.ts` so components can call `categoryMeta(category)` instead of `ACTIVITY_CATEGORIES[category]`. Cost: 10 minutes. (`src/state/useInsightsData.ts:276-278`)

4. **Extract useResetOnOpen hook.** PlanMyDayModal, SessionReflectionModal, and AddNoteModal all implement the same form-reset pattern. Create `src/hooks/useResetOnOpen.ts` that takes initial values and dependency deps, returns a reset function, and handles the useEffect. Eliminates three identical 8-line blocks. Cost: 30 minutes, moderately high impact (removes repeated warnings and improves testability). (`src/components/dashboard/PlanMyDayModal.tsx:90-98`, `src/components/dashboard/SessionReflectionModal.tsx:99-105`, `src/components/projects/detail/AddNoteModal.tsx:20-26`)

5. **Add migrate function to focusStore.** Even a no-op migrate is a forcing function for safe version bumps. Add `migrate: (persisted, fromVersion) => persisted as { ... }` to focusStore persist config, matching the pattern in projectStore. Cost: 10 minutes, low cost, high value (unblocks safe schema evolution). (`src/state/focusStore.ts:323-355`)

6. **Migrate focusStore.project from name string to projectId.** Change `project: string` to `projectId: string`, add a derived `projectName` computed in a selector, update `setDailyPlan` to pass `projectId` instead of `projectName`. Update all components that currently do `projects.find((p) => p.name === focusStore.project)` to use the ID directly. Cost: 2 hours, critical impact (unblocks long-term session history without orphaning). (`src/state/focusStore.ts:24, 70, 267, 280`, `src/components/dashboard/PlanMyDayModal.tsx:79`, and all usages)

7. **Parameterize chart dimensions.** Extract magic numbers (280 for CircularTimer size, 600/200 for ProjectProgressChart W/H, 168/18 for donut size/thickness) into named constants at the top of each component or a shared `src/utils/chartConstants.ts`. Cost: 30 minutes, moderate impact (improves responsiveness and consistency). (`src/components/dashboard/FocusSessionCard.tsx:98-99`, `src/components/projects/detail/ProjectProgressChart.tsx:107-112`, `src/components/insights/CategoryDonut.tsx:19-20`)

8. **Implement rolling archive for sessionLog.** Add a separate store (`sessionArchive`) that holds sessions older than 1 year, exclude `sessionLog` entries older than 90 days from persistence, and lazy-load archives when needed. Cost: 4 hours, high value (solves unbounded persistence problem, improves performance at scale). (`src/state/focusStore.ts:82, 327-339`)

## Do Not Refactor Yet

- **Navigation structure and routing.** The three-column layout (Sidebar, MainContent, RightPanel) with bottom bar navigation is clean, responsive, and matches the mockup. Placeholder nav items (Focus Sessions, Progress, Inbox) don't need to be removed yet; they signal future scope. Wait until new routes are added before redesigning navigation.

- **The three-column grid layout in AppShell.** Works well on desktop and tablet, doesn't need tweaking. Don't refactor responsive behavior until a mobile design is approved.

- **Extracted hooks for single-use patterns.** `useCountdown` (mentioned in the baseline review) only exists in FocusSessionCard for the circular timer. Don't extract until a second timer-driven UI appears (e.g., break timer, study session timer). Premature extraction adds complexity.

- **SVG illustrations (SunsetBackdrop, FocusLadderLogo).** Both are performant, scale correctly, and are readable inline. Don't extract to `.svg` files or a separate illustration library until the design system calls for it or illustration reuse becomes necessary.

- **Tailwind color tokens.** The custom palette (brand-purple, accent-green, etc.) is consistent, well-named, and documented in `tailwind.config.ts`. Don't restructure until the design system expands (e.g., multiple theme variants, dark mode). Current approach is optimal for an MVP.

- **Component-level state (useState for planOpen, editing, tab).** This state is scoped to the component that uses it and doesn't need to persist or be shared. Don't promote to a store; that would be over-engineering. `useState` is the right tool here.

- **The fixed 6-tier ladder.** Tiers are currently hardcoded in `focusTiers.ts` with specific XP thresholds. The product hasn't decided whether tiers should be customizable, so don't generalize to a user-editable tier system. If customization is requested, add it then.
