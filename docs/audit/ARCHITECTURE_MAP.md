# Architecture Map

## App Entry Points

**React 18 + Vite SPA mounted via `index.html`:**

- `index.html` (line 16): root div `id="root"` with module script `src=/src/main.tsx`
- `src/main.tsx` (line 6): `createRoot(document.getElementById("root")!).render()` wraps `<App />` in `<StrictMode>`
- `src/App.tsx` (line 6): `<BrowserRouter>` wraps `<AppShell />`; react-router v7.15.0 mounted here
- `src/components/layout/AppShell.tsx` (line 12–33): 3-column flex grid layout with `<Sidebar />`, `<Routes>`, and page-specific right panels; `<BottomBar />` below

Vite v5.4.11 dev server and build pipeline. TypeScript 5.6.3 strict mode. Tailwind v3.4.17.

## Routes / Pages

All routes defined in `AppShell.tsx` (lines 24–30):

| Route | Component | Navigation |
|-------|-----------|-----------|
| `/` | `Navigate to /today` | Redirect on mount |
| `/today` | `TodayPage` | Sidebar nav, BottomBar (active), Insights nav |
| `/projects` | `ProjectsPage` | Sidebar nav, BottomBar, Insights nav |
| `/projects/:projectId` | `ProjectDetailPage` | Sidebar nav, Insights nav |
| `/learning` | `LearningPathPage` | Sidebar nav, BottomBar, Insights nav |
| `/insights` | `InsightsPage` | Sidebar nav, BottomBar, Insights nav |
| `*` | `Navigate to /today` | Fallback for undefined routes |

**Navigation sources:**
- `Sidebar.tsx` (lines 45–97): `NavList()` renders `NAV_ITEMS` from `src/data/navItems.ts` as `<NavLink>` elements. Hidden on mobile, visible at `lg:` breakpoint. Items with `path === null` are disabled placeholders ("Focus Sessions", "Progress", "Inbox").
- `BottomBar.tsx` (lines 55–84): Fixed footer bar (72px height) with `ITEMS` and `ITEMS_RIGHT` arrays. Left side: Today, Projects, Learning Path. Right side: Insights, Progress (disabled). Central floating "Quick add" button (disabled). Hidden xl quote area.

Both navs use `react-router-dom` `<NavLink>` with `end={true}` for exact matching on `/today`.

## Layout System

**AppShell grid (lines 13–33):**
- Container: `min-h-screen flex flex-col`
- Main content grid: `grid gap-0 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_400px] xl:grid-cols-[240px_minmax(0,1fr)_460px]`
  - Mobile (default): single column, Sidebar hidden, RightPanel hidden
  - `lg:`: 3 columns — Sidebar (240px), Main (flex), RightPanel (400px)
  - `xl:`: 3 columns — Sidebar (240px), Main (flex), RightPanel (460px) — wider right panel
- BottomBar: Fixed 72px footer below grid; `border-t`, 95% opacity with backdrop-blur

**Pages layout:**
- `TodayPage` (lines 4–10): renders `<MainContent />` and `<RightPanel />` sequentially; grid handles 3-column via parent AppShell
- `ProjectsPage` (lines 169–235): `<main>` + `<aside>` with right panel containing summary cards, filters, consistency reminder
- `ProjectDetailPage`: `<MainContent>` equivalent in main area (tabs, details) + `<aside>` with stats/event timeline
- `LearningPathPage` (lines 33–74): Separate 2-column grid inside main (`grid-cols-[280px_minmax(0,1fr)]`) for module outline + topic detail; right `<aside>` for notes panel
- `InsightsPage` (lines 44–75): Main area (filters, summary, sessions feed) + right aside (donut chart, trend, quick filters)

**Mobile collapse:** Sidebar and RightPanel hidden until `lg:` breakpoint; main content takes full width on mobile.

## State Management

Four Zustand v5.0.2 stores persisted to localStorage. Each store uses `persist()` middleware with `createJSONStorage(() => localStorage)`.

### `useFocusStore` (src/state/focusStore.ts)
**File:** `src/state/focusStore.ts:218–356`
**Export:** `useFocusStore` hook
**State slices:**
- Session control: `status` ("idle"|"running"|"paused"), `durationSec`, `remainingSec`, `nextBreak`
- Active session context: `projectId` (string), `project` (denormalized name), `task` (string)
- Gamification: `currentTierId` (number), `xp` (number), `focusStreakDays`, `projectStreakDays`
- Planning: `dailyPlan` (DailyPlan | null)
- Session logging: `sessionLog` (LoggedSession[]), `pendingReflectionFor` (CompletedSession | null)
- Flags: `focusMode`, `notificationsMuted`, `distractionsBlocked`

**Key actions:**
- Session lifecycle: `start()`, `pause()`, `resume()`, `end()`, `tick()` (1Hz countdown)
- Context: `setActiveProject({ id, name })`, `setDuration(sec)`, `setDailyPlan(plan)`, `clearDailyPlan()`
- XP/tier: `setTier(tierId)`, `setXp(xp)`, `xpForSession(session)` (exported function), `applyXpAward(tierId, xp, award)` (exported function)
- Streaks: `setFocusStreak(days)`, `setProjectStreak(days)`
- Reflection: `submitReflection(reflection)`, `dismissReflection()`

**Persistence:**
- localStorage key: `"focus-ladder.focus"`
- version: 2
- partialize: persists only {projectId, project, task, durationSec, flags, currentTierId, xp, focusStreakDays, projectStreakDays, dailyPlan, sessionLog} (lines 327–339)
- merge: resets `status` to "idle", `remainingSec` to durationSec, and `pendingReflectionFor` to null on rehydration (lines 343–353). Rationale: stale session state shouldn't resume after page refresh.

**Cross-store coupling:** `lookupActivityCategory(projectId)` (lines 105–110) calls `useProjectStore.getState()` to fetch the project and extract its `activityCategory`. Used in `buildCompletion()` during session end.

### `useProjectStore` (src/state/projectStore.ts)
**File:** `src/state/projectStore.ts:106–238`
**Export:** `useProjectStore` hook
**State slice:**
- `projects: Project[]` — array of Project objects with tasks, notes, links, events, manual entries

**Key actions:**
- CRUD projects: `setProjects()`, `upsertProject(project)`, `removeProject(id)`
- Tasks: `addTask(projectId, {title, category?, dueDate?})`, `toggleTask(projectId, taskId)`, `removeTask(projectId, taskId)`
- Notes: `addNote(projectId, {title, body, pinned?})`, `updateNote(projectId, noteId, patch)`, `removeNote(projectId, noteId)`
- Links: `addLink(projectId, {title, url, icon?})`, `removeLink(projectId, linkId)`

**Persistence:**
- localStorage key: `"focus-ladder.projects"`
- version: 3
- migrate: converts legacy v2 projects (missing fields like description, status, tags, etc.) to v3 schema via `migrateProject()` helper (lines 226–235)
- No merge override; uses Zustand default merge

### `useLearningStore` (src/state/learningStore.ts)
**File:** `src/state/learningStore.ts:61–102`
**Export:** `useLearningStore` hook
**State slices:**
- `path: LearningPath` — immutable learning path (Machine Learning by default)
- UI state: `expandedModuleIds` (string[]), `selectedSubtopicId`, `notesSubtopicId`, `activeRightTab` ("notes"|"resources"|"tasks"), `viewMode` ("roadmap"|"list")

**Key actions:**
- `toggleModule(id)` — expand/collapse module in outline
- `selectSubtopic(id)` — set selected and notes subtopic to same id
- `setNotesSubtopic(id)` — focus notes panel on subtopic
- `setActiveTab(tab)` — switch right panel tab
- `setViewMode(mode)` — toggle roadmap vs. list view
- `appendUserParagraph(subtopicId, text)` — add user note to subtopic's `note.userParagraphs[]`

**Persistence:**
- localStorage key: `"focus-ladder.learning"`
- version: 1
- No migrate, no merge override
- Entire state persisted (default, no partialize)

### `useIdeaStore` (src/state/ideaStore.ts)
**File:** `src/state/ideaStore.ts:45–69`
**Export:** `useIdeaStore` hook
**State slice:**
- `ideas: Idea[]` — ideas with {id, text, status ("Future Idea"|"Maybe Later"|"Incubating"), createdAt}

**Key actions:**
- `addIdea(text, status)` — push new idea with generated id
- `removeIdea(id)` — filter out idea by id

**Persistence:**
- localStorage key: `"focus-ladder.ideas"`
- version: 1
- No migrate, no merge override
- partialize: persists only {ideas} (line 66)

### Derived Hooks
**useWeeklyStats** (src/state/useWeeklyStats.ts:65–68): Reads `sessionLog` from focusStore; buckets sessions by week; returns FocusStatsData {totalMinutes, sessionCount, completionRate, daily[], maxYHours}. Used in Sidebar StreaksCard and RightPanel FocusStatsPanel.

**useInsightsData** (src/state/useInsightsData.ts:267–274): Reads `sessionLog` from focusStore; applies InsightsFilters {dateRange, quickFilter, projectId}; returns InsightsData {summary, sessions, byCategory[], trend, logEmpty}. Used in InsightsPage.

**useProjectStats** (src/state/useProjectStats.ts:88–97): Reads sessionLog from focusStore and manualEntries from a specific project in projectStore; computes ProjectStats {totalMinutes, weekMinutes, monthMinutes, sessionCount, lastActivityAt}. Also exports `useAllProjectStats()` (lines 99–109) which maps all projects to their stats; and `sortProjects()` (lines 111–137) which sorts project array by recent/name/progress/focusTime.

## Persistence

**localStorage keys and versions:**
| Store | Key | Version | Migrate? | Merge? | Notes |
|-------|-----|---------|----------|--------|-------|
| focusStore | `focus-ladder.focus` | 2 | No | Yes (custom) | Resets status, reflection on rehydration; partializes session state only |
| projectStore | `focus-ladder.projects` | 3 | Yes | Default | Migrates v2 schema to v3 (adds description, status, tags, cover, etc.) |
| learningStore | `focus-ladder.learning` | 1 | No | Default | Full state persisted; immutable path object |
| ideaStore | `focus-ladder.ideas` | 1 | No | Default | Only ideas array persisted |

**Rehydration behavior:**
- focusStore: custom merge (lines 343–353) intentionally resets transient session state (running, paused, pending reflection) on rehydration to prevent stale timers or orphaned modals
- projectStore: migrate function handles schema evolution from v2→v3
- learningStore, ideaStore: default merge; no version-aware migration (risk: breaking schema changes would not be handled)

**What's NOT persisted (reset on page refresh):**
- focusStore: `status`, `remainingSec`, `pendingReflectionFor` (transient session state)
- All stores: computed state (derived hooks are recalculated on render, not stored)

## Data Models

**Focus & Sessions:**
- `CompletedSession` (src/state/focusStore.ts:33–46): {id, projectId, project (denormalized name), task, startedAt, endedAt, plannedDurationSec, actualDurationSec, completedNaturally, activityCategory, sessionType ("deep"|"light"|"learning"), tags[]}
- `SessionReflection` (lines 48–55): {sessionId, focusLevel (1–5), energyLevel (1–5), reflection?, completedPlanned, createdAt}
- `LoggedSession` (lines 57–60): {session: CompletedSession, reflection: SessionReflection | null}
- `DailyPlan` (lines 22–29): {projectId, projectName, primaryTask, secondaryTask?, plannedDurationMin, createdAt}
- `SessionType` (line 31): "deep" | "light" | "learning"

**Projects:**
- `Project` (src/data/projects.ts): {id, name, description, category, status ("active"|"on-hold"|"completed"|"archived"), tags[], weeklyMinutes, weeklyGoalMinutes, progressPercent, color ("purple"|"green"|"orange"), iconKey ("music"|"book"|"code"), activityCategory, cover, manualEntries[], tasks[], notes[], links[], events[], createdAt, updatedAt}
- `ProjectTask` (lines 109–116): {id, title, completed, category?, dueDate?, createdAt}
- `ProjectNote` (lines 118–125): {id, title, body, pinned?, createdAt, updatedAt}
- `ProjectLink` (lines 129–134): {id, title, url, icon? ("github"|"notion"|"drive"|"link")}
- `ProjectEvent` (lines 144–149): {id, kind ("session_completed"|"task_added"|"task_completed"|"note_added"|"note_updated"|"project_updated"), title, at}

**Learning:**
- `LearningPath` (src/data/learningPath.ts:43–48): {id, title, subtitle, modules[]}
- `LearningModule` (lines 34–41): {id, numericLabel, title, completedCount, totalCount, subtopics[]}
- `LearningSubtopic` (lines 22–32): {id, numericLabel, title, description?, status ("not-started"|"in-progress"|"completed"), progress?, resources[], children[], note?}
- `LearningNote` (lines 12–20): {subtopicId, heading, intro, bullets[], insight, code {language, source}, userParagraphs[]}
- `LearningResource` (lines 5–10): {id, title, kind ("video"|"book"|"pdf"|"article"), meta?}

**Ideas:**
- `Idea` (src/state/ideaStore.ts:8–13): {id, text, status ("Future Idea"|"Maybe Later"|"Incubating"), createdAt}

**Activity Categories:**
- `ActivityCategory` (src/data/activityCategories.ts:1–8): "coding" | "learning" | "planning" | "reading" | "design" | "music" | "other"
- Each category has metadata (label, hex color for charts, Tailwind classes for bg/text)

**Focus Tiers:**
- `FocusTier` (src/data/focusTiers.ts:3–10): {id, label, minutes, durationLabel, xpToNext, icon}
- 6 tiers defined (Tier 1–6); Tier 6 has xpToNext = Infinity (peak tier)

## Component Organization

**src/components/ folder structure:**

| Folder | Purpose |
|--------|---------|
| `layout/` | Shell, routing grid, sidebar, bottom bar: `AppShell.tsx`, `Sidebar.tsx`, `BottomBar.tsx`, `TodayPage.tsx`, `MainContent.tsx`, `RightPanel.tsx` |
| `dashboard/` | Today page widgets: `FocusSessionCard.tsx`, `IdeaParkingLot.tsx`, `PlanMyDayModal.tsx`, `SessionReflectionModal.tsx`, `FocusLadderPanel.tsx`, `FocusStatsPanel.tsx`, `ActiveProjectsPanel.tsx` |
| `projects/` | Projects gallery & management: `ProjectsPage.tsx`, `ProjectCard.tsx`, `ProjectListRow.tsx`, `ProjectFormModal.tsx`, `LogManualTimeModal.tsx`, `ProjectFocusDonutPanel.tsx`, `ProjectsQuickFiltersPanel.tsx`, `StayConsistentPanel.tsx` |
| `projects/detail/` | Project detail page: `ProjectDetailPage.tsx`, `ProjectHero.tsx`, `ProjectTabs.tsx`, `ProjectOverviewCard.tsx`, `ProjectProgressChart.tsx`, `ProjectTasksPanel.tsx`, `ProjectTagsCard.tsx`, `ProjectLinksCard.tsx`, `ProjectSessionsPanel.tsx`, `ProjectNotesPanel.tsx` |
| `learning/` | Learning path & progress: `LearningPathPage.tsx`, `LearningHeader.tsx`, `ModuleOutline.tsx`, `TopicDetail.tsx`, `NotesPanel.tsx` |
| `insights/` | Analytics & session log: `InsightsPage.tsx`, `SummaryCards.tsx`, `InsightsFilters.tsx`, `SessionsFeed.tsx`, `CategoryDonutPanel.tsx`, `CategoryDonut.tsx`, `CategoryTrendPanel.tsx`, `QuickFiltersPanel.tsx`, `InsightsEmptyState.tsx` |
| `ui/` | Shared primitives: `Card.tsx`, `Modal.tsx`, `ProgressRing.tsx` (+ others, e.g., form inputs, badges) |

## Styling System

**Tailwind v3.4.17** with custom design tokens in `tailwind.config.ts` (lines 6–59):

**Color palette** (lines 8–36):
- `bg.{base, card, cardHover, elevated}` — dark grays (#0B0F1A to #171D2D)
- `border.{subtle, strong}` — divider colors (#1F2638 to #2A3349)
- `text.{primary, secondary, muted}` — text hierarchy (#F4F6FB to #6B7390)
- `brand.{purple, purpleDeep, purpleSoft}` — primary accent (#8B7CF6, #5B4DCB, 0.12 alpha)
- `accent.{green, greenSoft, yellow, yellowSoft, orange, orangeSoft, red}` — secondary accents

**Typography:**
- Font family: Inter (fallback system stack)
- Font feature settings: custom OpenType features in `src/index.css` (line 14)

**Spacing & Shadows:**
- Custom border radius: `2xl: 16px`
- Custom shadows: `card` (subtle inset light), `focusGlow` (green ring + halo)

**Global CSS** (src/index.css):
- Base resets: html/body/root = 100% height
- Antialiasing, font smoothing
- Custom scrollbar (thin track, #1f2638 thumb)

**Icons:** lucide-react v0.469.0 throughout (18–24px sizes, custom stroke widths)

## Known Architectural Risks

### 1. **Denormalized projectId + project name in focusStore**
**File:** `src/state/focusStore.ts:69–70`
**Risk:** focusStore carries both `projectId` (string) and `project` (name string). If a project is renamed in projectStore, focusStore's denormalized name becomes stale. Sessions logged with the old name will show the project's old name forever. No foreign-key constraint or migration path exists.
**Impact:** Session history will show outdated project names if projects are renamed; user confusion, audit trail inconsistency.

### 2. **Cross-store coupling via .getState()**
**File:** `src/state/focusStore.ts:105–110`
**Risk:** focusStore calls `useProjectStore.getState()` synchronously in `lookupActivityCategory()` to fetch project metadata. This creates a hidden dependency on projectStore's rehydration order and presence. If projectStore fails to load or diverges schema, focusStore will silently fall back to "other" category instead of surfacing the error.
**Impact:** Session categorization unreliable if projectStore data is corrupted; no explicit error handling or logging.

### 3. **Missing migrate() in focusStore, learningStore, ideaStore**
**File:** `src/state/focusStore.ts:218–356`, `src/state/learningStore.ts:61–102`, `src/state/ideaStore.ts:45–69`
**Risk:** Only projectStore has a `migrate()` function (v2→v3). focusStore (version 2), learningStore (version 1), and ideaStore (version 1) lack versioned schema migration. If you add a required field to CompletedSession or LearningSubtopic, old persisted data will be missing that field; components will receive undefined values or crash.
**Impact:** Breaking schema changes to persisted objects cannot be handled gracefully; forced user data loss or client errors on version upgrades.

### 4. **Hand-rolled SVG charts in InsightsPage**
**File:** `src/components/insights/CategoryDonut.tsx`, `CategoryTrendPanel.tsx` (not fully read, but referenced)
**Risk:** Charts are custom SVG, not a charting library. No built-in accessibility, no responsive resize handling, no data validation. Maintenance burden if chart specs change (e.g., new category colors, different axis scale).
**Impact:** Accessibility compliance risk; harder to iterate chart designs; potential math errors in path generation.

### 5. **RightPanel as page-specific component, not layout-wide**
**File:** `src/components/layout/AppShell.tsx:18–19`, `TodayPage.tsx:4–10`
**Risk:** AppShell defines a 3-column grid with 400–460px right column, but RightPanel is rendered *only inside TodayPage*. ProjectsPage, ProjectDetailPage, LearningPathPage, and InsightsPage define their own `<aside>` elements that don't align with the grid layout. On mobile, each page's aside can become out-of-sync with the grid's breakpoint behavior.
**Impact:** Inconsistent right-panel behavior across pages; potential layout jank if a page's aside logic differs from AppShell's grid assumptions; harder to refactor shared right-sidebar components.

### 6. **No validation of projectId references in focusStore**
**File:** `src/state/focusStore.ts:69, 223`
**Risk:** focusStore initializes with `projectId: "harmonia-ep"` which must exist in projectStore's SEED_PROJECTS. If seed data changes or is deleted, setActiveProject() doesn't validate that the projectId exists in projectStore. Sessions can be logged against a project that no longer exists.
**Impact:** Orphaned sessions; crash risk if ProjectDetailPage or filtering logic assumes project exists.

## Recommended Architecture Cleanup

1. **Normalize project name in focusStore** (`src/state/focusStore.ts:69–70`)
   Remove the `project: string` field; lookup name only when rendering. Add a selector hook `useFocusProjectName()` that reads projectId and looks up the name in projectStore in real-time. Stops denormalization drift.

2. **Add version + migrate() to focusStore** (`src/state/focusStore.ts:218–226`)
   Increment version to 3; add a `migrate: (persisted, fromVersion) => { … }` handler that fills in missing fields with defaults (e.g., new category fields default to "other"). Enables safe schema evolution without data loss.

3. **Wrap useProjectStore.getState() in focusStore with error boundary** (`src/state/focusStore.ts:105–110`)
   Check if the result is null/undefined and emit a console.warn or telemetry event. Ensures silent fallback to "other" is at least logged and visible in debugging.

4. **Consolidate right-sidebar rendering into RightPanel component** (`src/components/layout/AppShell.tsx`)
   Move logic from page-specific asides (ProjectsPage, InsightsPage, etc.) into RightPanel's render function; accept props (route, filters) to vary content. Ensures all pages respect the grid layout consistently.

5. **Switch to a charting library for SVG charts** (`src/components/insights/CategoryDonut.tsx`)
   Replace hand-rolled SVG with a library like `recharts` or `visx`. Gains accessibility (ARIA labels), responsive resizing, and easier maintenance. Trade-off: ~20–40KB bundle size increase, but offsets maintenance risk.

6. **Validate projectId on setActiveProject** (`src/state/focusStore.ts:266–267`)
   In the `setActiveProject` action, check that the projectId exists in useProjectStore; warn if not found. Prevents orphaned session logs and catches bugs earlier.

