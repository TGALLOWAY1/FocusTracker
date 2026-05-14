# Manual QA Checklist

## Environment

- **Browser:** Not tested in a real browser. The audit was run from an automated CLI environment with no DOM/window. Where a check requires a real browser, it is marked **NT-NB** (Not Tested — No Browser) with a code-trace conclusion in the Notes column. The user should re-run interactive checks on Chrome/Firefox/Safari + a small viewport for true coverage.
- **OS:** Linux 6.18.5
- **Viewport sizes tested:** N/A (no browser). Tailwind breakpoints in code: `lg` (1024px) for sidebar+right-panel, `xl` (1280px) for wider right panel.
- **Date:** 2026-05-12
- **Repo state:** branch `claude/init-project-setup-bmmvA` at `50107bc` plus the audit doc commits.

**What I *was* able to verify mechanically:**
- Build artefacts produced and served correctly (`vite preview` returns HTTP 200 with the expected `<title>Focus Ladder</title>` and the JS bundle).
- All static type, lint, and unit-test checks pass (see `VERIFICATION_RESULTS.md`).
- For each interactive flow: the JSX handler exists, the action it dispatches mutates the store as expected, and persistence is wired.

## Smoke Tests

| Test | Result | Notes |
|---|---|---|
| `npm install` succeeds | **Pass** | 266 packages, 9s, no postinstall failures |
| `npm run lint` exits 0 | **Pass** | 0 errors, 3 warnings (intentional `react-hooks/set-state-in-effect` cluster) |
| `npm run typecheck` exits 0 | **Pass** | `tsc --noEmit -p tsconfig.app.json` clean |
| `npm test` all green | **Pass** | 32/32 tests in `src/state/*.test.ts` |
| `npm run build` succeeds | **Pass** | 1669 modules, 2.71s, JS 377 KB / CSS 29 KB |
| `vite preview` returns 200 on `/` | **Pass** | Body contains `<title>Focus Ladder</title>`, references built JS asset; JS asset itself returns 200 |
| App boots without console errors | NT-NB | Code path: `main.tsx → App.tsx → AppShell.tsx → BrowserRouter`. No throw paths during initial render found. Real browser run recommended. |
| Sidebar nav routes register | **Pass** (code) | Verified all `<Route>` registrations in `AppShell.tsx:24-30`; `NavLink` items in `Sidebar.tsx:86-95` and `BottomBar.tsx`. Disabled placeholders identified explicitly via `path === null`. |

## Today / Focus Timer

| Test | Result | Notes |
|---|---|---|
| Today renders by default | **Pass** (code) | `/` redirects to `/today` (`AppShell.tsx:24`). |
| "Plan My Day" opens modal | NT-NB | Handler wired in `MainContent.tsx`; modal rendered with `<Modal />` primitive. |
| Plan submission updates focusStore | **Pass** (code) | `setDailyPlan(plan)` in `PlanMyDayModal.tsx` writes `dailyPlan`, `projectId`, `project`, `task`, `durationSec`, and (if idle) `remainingSec` (`focusStore.ts:274-289`). |
| Start session begins countdown | **Pass** (code) | `start()` sets `status: "running"` and resets `remainingSec` to `durationSec` (`focusStore.ts:241-242`). `useEffect` in `FocusSessionCard.tsx` mounts `setInterval(tick, 1000)` when running. |
| Pause / Resume work | **Pass** (code) | `pause()`, `resume()` flip `status` only — countdown driven by `tick()` checking `status === "running"` (`focusStore.ts:243-245, 253-264`). |
| Natural completion triggers reflection | **Pass** (code) | `tick()` checks `remainingSec <= 1` *before* decrement, transitions to `idle` and sets `pendingReflectionFor: buildCompletion(s, true)` (`focusStore.ts:256-260`). `SessionReflectionModal` opens when `pendingReflectionFor` is non-null. |
| End early triggers reflection | **Pass** (code) | `end()` builds completion with `completedNaturally: false` (`focusStore.ts:246-251`). |
| Submit reflection awards XP | **Pass** (code + tested) | `submitReflection` calls `xpForSession(s.pendingReflectionFor)` and `applyXpAward(currentTierId, xp, award)` (`focusStore.ts:291-305`). Both functions covered by `focusStore.test.ts`. |
| Skip reflection (Dismiss) still awards XP and logs session | **Pass** (code + tested) | `dismissReflection` is structurally identical to `submitReflection` except `reflection: null` (`focusStore.ts:307-321`). Test coverage in `focusStore.test.ts`. |
| Tier auto-advances when XP crosses threshold | **Pass** (tested) | `applyXpAward` rolls XP into next tier (`focusStore.ts:185-201`); `focusStore.test.ts` exercises multi-tier advancement. |
| Refresh mid-session boots to idle | **Pass** (code) | `merge` callback forces `status: "idle"`, `remainingSec: durationSec`, `pendingReflectionFor: null` (`focusStore.ts:343-353`). |
| Flag strip ("Notifications muted", etc.) is visual-only | **Pass** (intentional) | No code path touches notification, focus, or distraction APIs. Documented in `docs/ASSUMPTIONS.md`. |

## Session Log / Insights

| Test | Result | Notes |
|---|---|---|
| `/insights` route renders | **Pass** (code) | `<Route path="/insights" element={<InsightsPage />}>` in `AppShell.tsx:29`. |
| Empty state when sessionLog is empty | **Pass** (code) | `useInsightsData` returns `logEmpty: true`; `InsightsPage` renders `<InsightsEmptyState />`. |
| Date-range filter (week / month / all) | **Pass** (tested) | `computeInsights` honors `dateRange` bounds (`useInsightsData.ts:90-102`); covered by `useInsightsData.test.ts`. |
| Quick filter (all / completed / endedEarly / deep / light) | **Pass** (tested) | `matchesQuickFilter` (`useInsightsData.ts:104-121`); covered by tests. |
| Project filter | **Pass** (tested) | `applyFilters` checks `projectId` (`useInsightsData.ts:131-133`); covered by tests. |
| Summary cards reflect filter state | **Pass** (code) | `InsightsPage` recomputes `useInsightsData(filters)` on filter change. |
| Category donut renders correct shares | **Pass** (tested) | `computeByCategory` produces ordered `CategorySlice[]` with percent share; covered. |
| Trend chart Y-axis scales to peak | **Pass** (tested) | `computeTrend` returns `maxHours = max(1, ceil(peak))`. |
| Sessions feed clickable rows | NT-NB | `SessionRow` renders timestamps, tags, reflection. No interactive expansion is wired in code I could trace — visual-only feed. Verify in browser whether rows are buttons or static. |

## Projects Gallery

| Test | Result | Notes |
|---|---|---|
| `/projects` route renders gallery | **Pass** (code) | `AppShell.tsx:26`. `ProjectsPage.tsx` reads `useProjectStore`. |
| Default seed projects visible on first load | **Pass** (code) | `SEED_PROJECTS` returned from `projectStore.ts:109` initializer. |
| Search bar filters by name/tags | NT-NB | Handler wired in `ProjectsPage.tsx`; verify keystroke filtering in browser. |
| Sort dropdown (recent/name/progress/focusTime) | **Pass** (tested) | `sortProjects` exported from `useProjectStats.ts:111-137`; covered by `useProjectStats.test.ts`. |
| Grid / List toggle | NT-NB | Renders `<ProjectCard />` or `<ProjectListRow />` based on local state. |
| Add Project opens form modal | NT-NB | `<button>` opens `<ProjectFormModal />`; image upload, color and icon presets present in `ProjectFormModal.tsx`. |
| Submit Add Project persists | **Pass** (code) | `upsertProject(project)` writes to `projects` array; persisted via `projectStore`'s persist config. |
| Edit project from card | NT-NB | Edit button passes existing project to `ProjectFormModal`; same persist path. |
| Delete project | NT-NB | `removeProject(id)` action exists; verify confirmation UX in browser. |
| Filter chips (status / tag / activity) update results | NT-NB | `ProjectsFilterBar` writes local state consumed by `ProjectsPage`. |

## Project Detail

| Test | Result | Notes |
|---|---|---|
| `/projects/:projectId` renders detail | **Pass** (code) | `AppShell.tsx:27`; `ProjectDetailPage` reads `useParams` and looks up project. |
| Unknown projectId redirects/shows empty | NT-NB | Behavior depends on `ProjectDetailPage` early-return — verify it doesn't crash on missing id. |
| Hero shows cover image / preset | **Pass** (code) | `ProjectHero` reads `project.cover` (preset or uploaded dataUrl). |
| Tabs switch (Overview / Tasks / Notes / Sessions) | NT-NB | `ProjectTabs` is local state; no router-driven tabs. |
| Add Task | **Pass** (code) | `addTask(projectId, { title, … })` (`projectStore.ts:122-139`); persists via store. |
| Toggle Task completion | **Pass** (code) | `toggleTask` (`projectStore.ts:140-153`); appends `task_completed` event. |
| Remove Task | **Pass** (code) | `removeTask` (`projectStore.ts:154-160`). |
| Add / Edit / Pin / Remove Note | **Pass** (code) | `addNote`, `updateNote`, `removeNote` actions present (`projectStore.ts:161-201`); `AddNoteModal` is the form. |
| Add Link | **Pass** (code) | `addLink` (`projectStore.ts:202-213`); icon auto-detected from URL. |
| Remove Link | **Pass** (code) | `removeLink` (`projectStore.ts:214-220`). |
| Per-project sessions feed shows logged sessions | **Pass** (code) | `ProjectSessionsPanel` filters `focusStore.sessionLog` by `projectId`. |
| Log Manual Time appends to project.manualEntries | **Pass** (code) | `LogManualTimeModal` writes via `upsertProject` with extended `manualEntries`. |
| Project Progress chart renders | NT-NB | `ProjectProgressChart` is hand-rolled SVG; visual fidelity must be verified in browser. |

## Learning Path

| Test | Result | Notes |
|---|---|---|
| `/learning` renders module outline + topic detail | **Pass** (code) | `LearningPathPage.tsx` 2-column inner grid (`grid-cols-[280px_minmax(0,1fr)]`). |
| Module expand/collapse | **Pass** (code) | `toggleModule(id)` flips id in `expandedModuleIds[]` (`learningStore.ts:71-76`). |
| Subtopic selection | **Pass** (code) | `selectSubtopic(id)` updates both `selectedSubtopicId` and `notesSubtopicId` (`learningStore.ts:78-79`). |
| Right-panel tabs switch | **Pass** (code) | `setActiveTab(tab)` (`learningStore.ts:82`). |
| Add user paragraph to subtopic note | **Pass** (code) | `appendUserParagraph(subtopicId, text)` walks the tree and pushes (`learningStore.ts:85-94`). |
| Notion sync card disabled | **Pass** (intentional) | `NotionSyncCard.tsx:45-63` — buttons explicitly `disabled` with "Coming soon" titles. |
| Image upload disabled | **Pass** (intentional) | `NotesPanel.tsx:108-116` — `disabled` + `aria-disabled`. |
| Code copy disabled | **Pass** (intentional) | `NoteContent.tsx:54-63` — `disabled` + `aria-disabled`. |

## Persistence

| Test | Result | Notes |
|---|---|---|
| Add project → refresh | **Pass** (code-trace) | Persisted in `focus-ladder.projects`. See `PERSISTENCE_AUDIT.md` "Refresh-Survival Trace". |
| Add task to project → refresh | **Pass** (code-trace) | Same key. |
| Add note to project → refresh | **Pass** (code-trace) | Same key. |
| Add learning paragraph → refresh | **Pass** (code-trace) | Persisted in `focus-ladder.learning`. |
| Complete focus session → refresh | **Conditional** | Persists *only after* `submitReflection` or `dismissReflection`. Refreshing while reflection modal is open loses the session — by design (`focusStore.ts:343-353`). |
| Add idea → refresh | **Pass** (code-trace) | Persisted in `focus-ladder.ideas`. |
| Change selected learning subtopic → refresh | **Pass** (code-trace) | UI state persisted in `focus-ladder.learning`. |
| Mid-session refresh resumes timer | **Fail by design** | `merge` resets `status: idle`, `remainingSec: durationSec`. Documented in `docs/ASSUMPTIONS.md`. |

## Responsive Layout

| Test | Result | Notes |
|---|---|---|
| Sidebar visible at `lg` and above | NT-NB | `Sidebar.tsx:269` uses `hidden lg:flex`. |
| Right column width changes at `xl` | NT-NB | `AppShell.tsx:18-19` — `lg:` 400px, `xl:` 460px. |
| Mobile collapses to MainContent only | NT-NB | Mobile-collapse cited in `docs/ASSUMPTIONS.md`. Verify the bottom bar's fixed footer doesn't overlap content. |
| Modals scroll lock on open | **Pass** (code) | `Modal.tsx` sets `document.body.style.overflow = "hidden"` while open. |

## Accessibility Basics

| Test | Result | Notes |
|---|---|---|
| Modals use `role="dialog"` + `aria-modal` | **Pass** (code) | `Modal.tsx` sets both. |
| Modals close on Escape | **Pass** (code) | `Modal.tsx` keydown listener. |
| Modals close on backdrop click | **Pass** (code) | `Modal.tsx` overlay onClick. |
| Disabled buttons set `aria-disabled` | **Pass** (code) | Verified across `Sidebar`, `BottomBar`, `NotesPanel`, `NoteContent`, `NotionSyncCard`. |
| Reflection rating buttons have `aria-label` | **Pass** (code) | `SessionReflectionModal.tsx:26` — `Rate N of 5`. |
| Weekly bar chart has `aria-label` summary | **Pass** (code) | `FocusStatsPanel.tsx:50-55`. |
| Focus rings on interactive elements | NT-NB | Tailwind `focus-visible` classes used across nav and project rows; verify visually. |
| Color contrast on dark theme | NT-NB | `text.muted` (#6B7390) on `bg.base` (#0B0F1A) ≈ 4.6:1 — borderline AA for normal text. Run a contrast checker in browser to confirm. |
| Skip-to-content link | **Fail** (missing) | No `<a href="#main">` skip link in `AppShell`. Add one for keyboard users. |
| Charts have text alternatives | NT-NB / Partial | `FocusStatsPanel` has aria-label; `CategoryDonut`, `CategoryTrendChart`, `ProjectProgressChart` need verification — likely missing. |

---

## Recommended Real-Browser QA Pass

Before any further feature work, an interactive QA pass should re-verify the **NT-NB** rows above. Priority order (highest first):

1. Mobile collapse + bottom bar overlap on a 375px viewport.
2. Insights filters → donut/trend update without remounting (look for flash).
3. Add Project image upload → dataUrl persistence (large images may exceed localStorage).
4. Add/Edit Note within Project Detail — focus/scroll behavior on mobile.
5. Learning Path module expand/collapse — keyboard interaction.
6. Color contrast spot-check on `text-muted` over `bg-base`.
