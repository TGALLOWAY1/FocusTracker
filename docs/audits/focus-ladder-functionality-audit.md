# Focus Ladder Functionality Audit

This document serves as an audit of the current state of the Focus Ladder UI, separating fully connected functionality from display-only or stubbed elements.

## 1. Today Page

### Interactive Controls
- **Real/Connected**:
  - "Plan My Day" button opens a real modal (`PlanMyDayModal`) that updates the global `focusStore`.
  - Timer controls (Start, Pause, Resume, End Session) in the `FocusSessionCard` are fully functional and update the `focusStore` timer loop.
  - Idea Parking Lot inputs and delete buttons write to and remove from `ideaStore`.
  - Session Reflection Modal rating controls (focus, energy, completion) and text input actually persist into the session log via `submitReflection`.
- **Stubbed/Mocked**:
  - The Focus Flags (Focus Mode, Notifications, Distractions) shown on the Focus Session Card are currently display-only toggles (they read from `flags` in `focusStore` but lack a UI to actively change them during a session).

### Data Sources
- **Real**:
  - Focus tier progress, streaks, weekly stats, and session history read from persisted Zustand stores (`focusStore`, `projectStore`).
  - Active projects panel dynamically lists the most recently active projects from the `projectStore`.

## 2. Projects Page

### Interactive Controls
- **Real/Connected**:
  - "New Project" button opens a fully functional modal to create projects.
  - Grid/List view toggle works and changes layout.
  - Sorting (recent, name, progress, focus time) correctly sorts the real project array.
  - Project Cards/Rows support editing via `ProjectFormModal` and logging manual time via `LogManualTimeModal`.
  - Filters (status, search text, quick filters) work correctly on the displayed list.
  - Project Detail pages (`/projects/:projectId`) are fully implemented routes displaying actual project tasks, links, notes, and session history.

### Data Sources
- **Real**:
  - Projects are stored in `projectStore` using `zustand/persist` (LocalStorage). Initialized with `SEED_PROJECTS` but fully mutable.
  - Donut charts and project stats (total minutes, progress) are derived from the real `sessionLog`.

## 3. Learning Path Page

### Interactive Controls
- **Real/Connected**:
  - Expanding/collapsing modules in the `ModuleOutline`.
  - Switching right-panel tabs (Notes, Resources) updates the view.
  - Adding and removing notes/user-paragraphs via the `AddNoteInput`.
- **Stubbed/Mocked**:
  - **Module Outline**: "Add Custom Module", "Search", and "Plus" buttons are disabled with a "Coming soon" title.
  - **Topic Detail**: "MoreHorizontal" and "Add Subtopic" buttons are disabled.
  - **Topic Detail**: "View all" resources button is disabled.
  - **Resources**: The external link button on resource items is disabled.
  - **Notes Panel**: The "Tasks" tab displays a hardcoded "Tasks are coming soon" empty state.
  - **Notes Panel**: Image and `@` mention buttons in the add note input are disabled.
  - **Notion Sync**: The `NotionSyncCard` has disabled "Open in Notion" and "MoreHorizontal" buttons. The text "Last synced 2m ago" is hardcoded and not connected to any sync logic.

### Data Sources
- **Mixed**:
  - The overall learning path structure (`MACHINE_LEARNING_PATH`) is static data.
  - However, user-added notes and paragraphs are persisted to `learningStore` via local storage.

## 4. Insights Page

### Interactive Controls
- **Real/Connected**:
  - Date range filters (This week, Last 30 days, All time) properly filter the session log.
  - Quick filters (Completed, Ended Early, Deep, Light) correctly filter the feed.
  - Deleting/discarding a session from the session feed works and rolls back XP / tier progress via `focusStore.deleteSession`.
- **Stubbed/Mocked**:
  - No major interactive stubs found here. All filters and lists appear hooked up to the real session log.

### Data Sources
- **Real**:
  - Summaries (total focus time, completion rate, average ratings), charts (Category Donut, Trend Line), and the headline insight are dynamically calculated from `sessionLog` in `useInsightsData`.

## 5. Duplicate UI & Navigation

### Duplicated Navigation
- **Sidebar vs. BottomBar**: The `Sidebar` component is restricted to desktop/large screens (`hidden lg:flex`), but the `BottomBar` component lacks any responsive hiding classes for its main container. As a result, **both** the left sidebar and the bottom navigation strip appear simultaneously on desktop. This creates redundancy and visual clutter.
  
### Other Duplications
- No major duplicated components beyond standard list rendering. The data model acts as a single source of truth across all pages (e.g. sessions completed in `Today` show up identically in `Insights` and `Projects`).

## 6. Routing and Persistence

- **Routing**: `react-router-dom` is used correctly. All major routes (`/today`, `/projects`, `/projects/:projectId`, `/learning`, `/insights`) are real and navigate cleanly.
- **Persistence**: Global state is managed by Zustand stores (`focusStore`, `projectStore`, `ideaStore`, `learningStore`), all of which use `persist` middleware with `createJSONStorage(() => localStorage)`. Refreshing the page preserves all created projects, completed sessions, logged notes, and current focus session state (except active timers which correctly fall back to idle). The app shares a consistent, unified source of truth.
