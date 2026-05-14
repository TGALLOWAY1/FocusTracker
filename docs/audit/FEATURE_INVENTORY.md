# Feature Inventory

Last updated: 2026-05-12  
Methodology: Post-PR code audit against actual implementations under `src/components/`, `src/state/`, and data files.

## Feature Status Table

| Feature | Status | Route / Location | Data Source | Persists? | Notes |
|---|---|---|---|---:|---|
| Today Dashboard | Complete | `/today` (TodayPage.tsx) | useFocusStore | Yes | Renders MainContent + RightPanel; greeting hardcoded to "Alex" (MainContent.tsx:17) |
| Focus Timer | Complete | MainContent.tsx / FocusSessionCard.tsx | useFocusStore | Partial | Session state persists; running status always resets to idle on reload (focusStore.ts:349) |
| Session Reflection Flow | Complete | SessionReflectionModal.tsx | useFocusStore | Yes | Modal triggers when session ends; XP awarded on submit/dismiss (focusStore.ts:294-321); reflection stored in sessionLog |
| Session Log / Reflection History | Complete | Insights page / ProjectDetailPage | useFocusStore.sessionLog | Yes | Persists via focus-ladder.focus key; grouped by day in SessionsFeed.tsx |
| Insights Page (summary, donut, trend, feed, filters) | Complete | `/insights` (InsightsPage.tsx) | useFocusStore.sessionLog + useInsightsData | Yes | Category donut, trend chart, summary cards, session feed all render from hooks; filters work (InsightsPage.tsx:34-42) |
| Plan My Day modal | Complete | MainContent.tsx / PlanMyDayModal.tsx | useFocusStore.setDailyPlan | Yes | Opens from Greeting; sets project, task, duration (PlanMyDayModal.tsx:71-114); updates focusStore |
| Idea Parking Lot | Complete | MainContent.tsx / IdeaParkingLot.tsx | useIdeaStore | Yes | Seeded with 3 demo ideas (ideaStore.ts:18-37); add/remove wired; persists to focus-ladder.ideas |
| Focus Ladder / XP / Tier progression | Complete | FocusLadderPanel.tsx (RightPanel) | useFocusStore | Yes | 6 tiers; XP awarded per session (focusStore.ts:174-180); tier progression implemented in applyXpAward (focusStore.ts:185-201) |
| Streaks (focus, project) | Complete | focusStore state | useFocusStore | Yes | focusStreakDays, projectStreakDays stored; no UI yet but state exists (focusStore.ts:78-79, 235, 272) |
| Active Projects panel | Complete | RightPanel.tsx / ActiveProjectsPanel.tsx | useProjectStore | Yes | Lists all projects with weekly progress; clicking sets active project + scrolls to timer (ActiveProjectsPanel.tsx:14-21) |
| Projects Gallery (`/projects`) | Complete | `/projects` (ProjectsPage.tsx) | useProjectStore | Yes | Grid/list toggle, sort dropdown, search bar, quick filters all functional (ProjectsPage.tsx:17-120) |
| Add Project (form, image picker) | Complete | ProjectFormModal.tsx | useProjectStore.upsertProject | Yes | Modal allows create + edit; image resize to dataUrl implemented (resizeImageToDataUrl imported); 3 color + 3 icon presets (ProjectFormModal.tsx:34-35, 95-370) |
| Project Detail Page | Complete | `/projects/:projectId` (ProjectDetailPage.tsx) | useProjectStore + useFocusStore | Yes | Hero, overview, tabs (Overview/Tasks/Notes/Sessions), progress chart, category donut, all render from data (ProjectDetailPage.tsx:62-180) |
| Project Tasks (add, toggle, remove) | Complete | ProjectTasksPanel.tsx | useProjectStore (addTask, toggleTask, removeTask) | Yes | Add form, checkbox toggle, delete button all wired (ProjectTasksPanel.tsx:43-100) |
| Project Notes (add, edit, pin, remove) | Complete | ProjectNotesPanel.tsx / AddNoteModal.tsx | useProjectStore (addNote, updateNote, removeNote) | Yes | Add, edit modal, pin toggle, delete all functional (ProjectNotesPanel.tsx:32-105) |
| Project Links (add, remove) | Complete | ProjectLinksCard.tsx | useProjectStore (addLink, removeLink) | Yes | Add form, URL→icon detection, delete button wired (ProjectLinksCard.tsx:41-130) |
| Project Sessions panel (per-project feed) | Complete | ProjectSessionsPanel.tsx | useFocusStore.sessionLog + filter by projectId | Yes | Lists sessions for project; timestamps formatted; no interactive elements (read-only) (ProjectSessionsPanel.tsx:30-97) |
| Log Manual Time | Complete | LogManualTimeModal.tsx | useProjectStore.upsertProject | Yes | Modal with minutes input + optional note; adds to project.manualEntries (LogManualTimeModal.tsx:14-98) |
| Learning Path Page | Complete | `/learning` (LearningPathPage.tsx) | useLearningStore | Yes | Renders module outline + topic detail + notes panel; toggle/select hooks all functional (LearningPathPage.tsx:1-74) |
| Learning Path module list / outline | Complete | ModuleOutline.tsx / ModuleRow.tsx | useLearningStore | Yes | Expandable modules with subtopics; expand state persisted (useLearningStore:65, 71-76) |
| Learning Path topic detail | Complete | TopicDetail.tsx / SubtopicCard.tsx | useLearningStore | Yes | Renders subtopic with resources; selection wired to learning store (LearningPathPage.tsx:24-31) |
| Learning Path Notes Panel (add notes, sync card) | Complete | NotesPanel.tsx | useLearningStore.appendUserParagraph | Partial | Notes input works (NotesPanel.tsx:71-106); Notion sync card rendered but disabled (NotionSyncCard.tsx:45-64) |
| Navigation (Sidebar links, BottomBar) | Complete | Sidebar.tsx / BottomBar.tsx | React Router | N/A | 4 routable items (Today, Projects, Learning, Insights); 3 placeholder items with null paths (Sidebar.tsx:73-95, BottomBar.tsx:34-40) |
| Quick Add FAB | Missing | BottomBar.tsx | N/A | N/A | Button disabled + aria-disabled=true with title "Quick add — coming later" (BottomBar.tsx:61-69) |

---

## Decorative / No-op Interactions

Buttons and interactive elements with no real handler, all marked disabled or cursor-default:

1. **Focus Sessions sidebar link** (Sidebar.tsx:73-82) — `path: null`; aria-disabled=true; cursor-default
2. **Progress sidebar link** (Sidebar.tsx:73-82) — `path: null`; aria-disabled=true; cursor-default  
3. **Inbox sidebar link** (Sidebar.tsx:73-82) — `path: null`; aria-disabled=true; cursor-default; badge: 7
4. **Quick Add FAB** (BottomBar.tsx:61-69) — `disabled` + `aria-disabled=true`; cursor-not-allowed; "Quick add — coming later"
5. **Focus sidebar link (BottomBar)** (BottomBar.tsx:13) — `path: null`; cursor-default (BottomItem.tsx:34-39)
6. **Progress sidebar link (BottomBar)** (BottomBar.tsx:20) — `path: null`; cursor-default
7. **Learning Path Notes: Image upload button** (NotesPanel.tsx:108-116) — `disabled` + `aria-disabled=true`; cursor-not-allowed; "Coming soon"
8. **Learning Path Notes: At-mention button** (NotesPanel.tsx:117-123) — `disabled` + `aria-disabled=true`; cursor-not-allowed
9. **Learning Path: Code copy button** (NoteContent.tsx:54-63) — `disabled` + `aria-disabled=true`; cursor-not-allowed; "Coming soon"
10. **Learning Path: Notion sync "Open in Notion" button** (NotionSyncCard.tsx:45-54) — `disabled` + `aria-disabled=true`; cursor-not-allowed; "Coming soon"
11. **Learning Path: Notion sync menu button** (NotionSyncCard.tsx:55-63) — `disabled` + `aria-disabled=true`; cursor-not-allowed

---

## Demo / Seed Data Surfaces

All places where real-looking data is actually seeded (not user-generated):

1. **Focus store initial project** (focusStore.ts:222-226) — hardcoded "harmonia-ep" (Harmonia EP)
2. **Focus store initial task** (focusStore.ts:224) — "Mixing and arrangement"
3. **Focus store greeting name** (MainContent.tsx:17) — hardcoded "Good morning, Alex"
4. **Idea Parking Lot** (ideaStore.ts:18-37) — 3 seed ideas: "Build AI tool...", "Learn Rust...", "Start podcast..."
5. **Projects list** (projects.ts:177-491) — 5 SEED_PROJECTS: ML Model Trainer (6h15m/week), Habit Garden (4h30m), Portfolio Redesign (3h), Data Science Handbook (5h), CLI Productivity Toolkit (2h)
   - Each includes seeded tasks (completed/pending), notes (pinned/regular), links (GitHub/Notion/Drive), and event logs
   - All dates relative to SEED_NOW constant (1715000000000 ≈ May 2024)
   - Manual entries (historical time logs) for all projects
6. **Learning Path** (learningStore.ts:64 + learningPath.ts) — MACHINE_LEARNING_PATH with hardcoded modules, subtopics, resources
   - Default expansion: expandedModuleIds=["core-concepts"] (learningStore.ts:65)
   - Default selection: selectedSubtopicId="2.6" (learningStore.ts:66)
7. **Focus Stats seeded data** (focusStats.ts) — seed data for daily/weekly stats if no live sessions exist
8. **Focus Tiers** (focusTiers.ts:12-19) — 6 tiers with XP thresholds (250→Infinity)

---

## Analysis of Persistence

### Fully Persisted (localStorage)
- **focus-ladder.focus** (focusStore): project, task, duration, flags, tier, XP, streaks, dailyPlan, sessionLog
- **focus-ladder.projects** (projectStore): all projects + tasks/notes/links/events
- **focus-ladder.learning** (learningStore): path state, expanded modules, selected subtopic, view mode
- **focus-ladder.ideas** (ideaStore): ideas list

### Partially Persisted
- **Focus Timer status**: stored as "idle" only on reload (running/paused never persist) (focusStore.ts:349)
- **Pending Reflection**: never persists; always cleared on reload (focusStore.ts:351)

### Not Persisted
- Right panel (RightPanel.tsx): stateless
- Navigation UI (active route from React Router)

---

## Notable Findings

### Incomplete Features (UI exists, functionality limited)
1. **Learning Path Notes**: Image upload disabled (NotesPanel.tsx:108-116)
2. **Learning Path: Notion integration**: "Open in Notion" + menu buttons disabled (NotionSyncCard.tsx:45-63)
3. **Learning Path: Code copy**: Copy button disabled (NoteContent.tsx:54-63)

### Navigation Placeholders
- "Focus Sessions", "Progress", "Inbox" sidebar items render but point to `path: null`
- Quick Add FAB centered in BottomBar is disabled ("coming later")

### Seed Data Extent
- 5 projects with ~20 tasks, ~5 notes, ~3 links per project
- 3 seeded ideas
- Full Machine Learning learning path with ~40 subtopics
- All seeded with relative timestamps (30–90 days in the past from May 2024)

### Session Log Handling
- Sessions only recorded when user explicitly calls `submitReflection()` or `dismissReflection()` (focusStore.ts:291-321)
- No auto-logging of completed timers without reflection
- XP awarded identically whether reflection is submitted or dismissed (focusStore.ts:310 = 294)

---

## Storage Keys Summary

| Store | Key | Version |
|---|---|---|
| Focus | `focus-ladder.focus` | 2 |
| Projects | `focus-ladder.projects` | 3 |
| Learning | `focus-ladder.learning` | 1 |
| Ideas | `focus-ladder.ideas` | 1 |

All use `createJSONStorage(() => localStorage)` and implement `partialize` to control what persists.

---
