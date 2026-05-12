# Persistence Audit

## Persistence Mechanism

The Focus Ladder app uses **Zustand `persist` middleware** paired with **`createJSONStorage(localStorage)`** to store application state across browser sessions. Four independent Zustand stores under `src/state/` each manage their own localStorage key with separate version management. Each store defines which slices are persisted via `partialize` or custom `merge` logic; stores without these default to full state persistence.

## localStorage Keys

| Store | Key | Version | Has migrate? | Has custom merge? | File:Line |
|-------|-----|---------|--------------|-------------------|-----------|
| focusStore | `focus-ladder.focus` | 2 | No | Yes (resets transient state) | focusStore.ts:324–326 |
| projectStore | `focus-ladder.projects` | 3 | Yes (v2→v3 migration) | No | projectStore.ts:223–225 |
| learningStore | `focus-ladder.learning` | 1 | No | No | learningStore.ts:97–99 |
| ideaStore | `focus-ladder.ideas` | 1 | No | No | ideaStore.ts:63–65 |

## Persisted Data

### focusStore (focus-ladder.focus)

**Explicitly persisted via `partialize` (focusStore.ts:327–339):**
- `projectId`: String ID of the active project
- `project`: Project name string (denormalized; see Hydration Risks)
- `task`: Current task description
- `durationSec`: Planned session duration in seconds
- `flags`: Object with `focusMode`, `notificationsMuted`, `distractionsBlocked` booleans
- `currentTierId`: Gamification tier ID (starts at 1)
- `xp`: Experience points within current tier (0+)
- `focusStreakDays`: Consecutive days of focus sessions (0+)
- `projectStreakDays`: Consecutive days on current project (0+)
- `dailyPlan`: Optional `DailyPlan` object (projectId, projectName, primaryTask, plannedDurationMin, createdAt)
- `sessionLog`: Array of `LoggedSession[]` — each containing `session: CompletedSession` and optional `reflection: SessionReflection` or `null`

**NOT persisted (intentionally reset on each rehydration via `merge`, focusStore.ts:343–353):**
- `status`: Session state (idle/running/paused) — always boots to "idle"
- `remainingSec`: Countdown timer — always resets to `durationSec`
- `nextBreak`: Break schedule — always resets to default
- `pendingReflectionFor`: Modal prompt state — always nulled on rehydrate

This design prevents stale timers and half-finished reflections from reappearing after a refresh.

### projectStore (focus-ladder.projects)

**Fully persisted (no `partialize` — entire state saved):**
- `projects`: Array of `Project[]` with nested `tasks[]`, `notes[]`, `links[]`, `events[]`

Migration (projectStore.ts:226–235) transforms legacy v2 projects (without description, status, tags, cover, createdAt, updatedAt) into v3 schema by calling `migrateProject()`.

### learningStore (focus-ladder.learning)

**Fully persisted (no `partialize`, no custom `merge`):**
- `path`: Entire `MACHINE_LEARNING_PATH` tree structure with nested modules and subtopics
- `expandedModuleIds`: Array of module IDs currently expanded in the roadmap view
- `selectedSubtopicId`: String ID of the subtopic being displayed
- `notesSubtopicId`: String ID of the subtopic whose notes are shown in the right panel
- `activeRightTab`: "notes" | "resources" | "tasks"
- `viewMode`: "roadmap" | "list"

**Mutable within persisted state:**
- `path.modules[].subtopics[].note.userParagraphs[]` — user-added learning notes accumulate in-place

### ideaStore (focus-ladder.ideas)

**Explicitly persisted via `partialize` (ideaStore.ts:66):**
- `ideas`: Array of `Idea[]` — each with id, text, status ("Future Idea" | "Maybe Later" | "Incubating"), createdAt

## Non-Persisted Data That Should Persist

### Critical misalignment: None identified in scope.

All data that should logically persist across refresh **does** survive:
- Project hierarchy, tasks, notes, links — persisted fully ✓
- Learning path selections and user-written paragraphs — persisted fully ✓
- Ideas — persisted fully ✓
- Focus streaks, XP, tier — persisted ✓
- Session history (sessionLog) — persisted ✓

**Intentional transience:**
- `focusStore.status`, `remainingSec`, `pendingReflectionFor` — designed to reset on refresh so stale timers don't resume and half-finished reflections disappear. This is a deliberate UX choice: mid-session refresh doesn't resume the old timer; users start fresh.

## Demo Data vs User Data

On first load, each store is seeded with demo data. Persistence overlays user changes on top. Once the user modifies any store, localStorage takes precedence on subsequent loads.

### Seeded defaults:

**focusStore (focusStore.ts:222–239):**
- `projectId`: "harmonia-ep"
- `project`: "Harmonia EP"
- `task`: "Mixing and arrangement"
- `durationSec`: 35 * 60 = 2100 sec (35 min)
- `currentTierId`: 1
- `xp`: 0
- `focusStreakDays`: 0
- `projectStreakDays`: 0
- `flags.focusMode`: true
- `flags.notificationsMuted`: true
- `flags.distractionsBlocked`: true
- `sessionLog`: [] (empty array)

**projectStore (projectStore.ts:109):**
- `projects`: `SEED_PROJECTS` array of 6 projects with rich demo data (ML Model Trainer, Habit Garden, Portfolio Redesign, Data Science Handbook, CLI Productivity Toolkit, Lo-fi Beats Collection). Each includes demo tasks, notes, links, events. See `src/data/projects.ts:177–567` for full definitions.

**learningStore (learningStore.ts:64–69):**
- `path`: `MACHINE_LEARNING_PATH` (src/data/learningPath.ts:217–255) — a 4-module learning roadmap (Foundations, Core Concepts, Advanced Topics, Specialization) with nested subtopics, some marked "completed", "in-progress", or "not-started", and one subtopic (2.6.3 "Data Preparation") with a seeded note and code example.
- `expandedModuleIds`: ["core-concepts"]
- `selectedSubtopicId`: "2.6"
- `notesSubtopicId`: "2.6.3"
- `activeRightTab`: "notes"
- `viewMode`: "list"

**ideaStore (ideaStore.ts:18–37):**
- `ideas`: `SEED` array of 3 seeded ideas ("Build AI tool for drum sampling", "Learn Rust programming", "Start podcast about music production") with timestamps relative to app load time.

On first app load, the user sees all demo data. After the user adds a project, idea, or learning note, those changes persist and are merged with (or overlay) the seeded defaults on next load.

## Hydration / Migration Risks

### 1. **focusStore version 2, no migrate** (focusStore.ts:324–326)

**Risk:** If a future PR changes the shape of `PersistedFocus` (e.g., removes `focusStreakDays`, adds a new field), there is **no migration function** to transform old data. Zustand will silently merge the persisted state with the new defaults, potentially losing or orphaning data.

**Current state:** Safe. The `merge` callback (lines 343–353) handles missing keys defensively: `durationSec = persisted.durationSec ?? currentState.durationSec`. But future shape changes *should* bump the version and add a `migrate` function.

### 2. **learningStore version 1, no migrate** (learningStore.ts:97–99)

**Risk:** No migration safeguard. If the learning path tree structure changes (new modules, removed subtopics, schema change to `note` or `userParagraphs`), persisted old data will not be transformed. Users' custom paragraphs in `path.modules[].subtopics[].note.userParagraphs[]` could become orphaned if the subtopic ID scheme changes.

**Current state:** Vulnerable. A simple addition of a module or subtopic rename will leave old data untouched but inaccessible.

### 3. **ideaStore version 1, no migrate** (ideaStore.ts:63–65)

**Risk:** No migration. If `Idea` type changes (add required field, change status enum), persisted ideas won't be auto-transformed.

**Current state:** Low risk (simple schema) but not future-proof.

### 4. **projectStore version 3 WITH migrate** (projectStore.ts:226–235) ✓ POSITIVE EXAMPLE

**Strength:** Migration function explicitly handles v2 → v3 upgrade:
```typescript
if (fromVersion < 3) {
  return { projects: raw.map((p) => migrateProject(p as LegacyV2Project)) };
}
```
The `migrateProject()` function fills in missing v3 fields (description, status, tags, cover, createdAt, updatedAt). This is the model for other stores.

### 5. **focusStore.project denormalization risk**

Lines 35–36 and 328–329 store `projectId` AND `project` (name string) in parallel:
```typescript
projectId: string;
project: string;  // e.g. "Harmonia EP"
```

**Risk:** If a user renames a project in `projectStore`, old `sessionLog` entries retain the old name string. The name becomes stale; if the project is deleted, the log entry orphans. E.g., a user renames "Harmonia EP" → "Harmonia v2" and deletes the old project; all historical sessions still reference the deleted project by the stale name string.

**Mitigation:** Could derive `project` name from `projectId` at read time via `useProjectStore.getState().projects.find(p => p.id === projectId)?.name ?? <persisted project>`.

### 6. **focusStore.sessionLog unbounded growth**

Line 300–302 prepends sessions to `sessionLog`:
```typescript
sessionLog: [
  { session: s.pendingReflectionFor, reflection },
  ...s.sessionLog,
],
```

**Risk:** No cap. After 1000 focus sessions, localStorage will contain ~500 KB+ of session data (each session ~500 bytes). No pruning, export, or archival. Eventually localStorage quota (~5–10 MB) could be approached; app behavior becomes unpredictable.

**Current state:** Not an immediate risk for demo/fresh installs, but will accumulate over months of heavy use.

## Malformed Data Handling

**No schema validation or type guards** are applied at rehydration time.

- If a user manually edits localStorage and corrupts the JSON (e.g., unclosed string, deleted field), Zustand will throw an error when parsing and the store will fall back to initial state.
- If a persisted value has the wrong type (e.g., `xp: "500"` instead of `500`, or `projects: null` instead of `[]`), there is **no try/catch or type coercion**. The store state will contain the malformed value; downstream code (components, handlers) will encounter `undefined` dereferences or type errors at runtime.
- **learningStore** and **focusStore** do not use `onRehydrateStorage` callback (Zustand lifecycle hook) to log or telemetry failed hydration.

**Recommendation:** Wrap rehydration in `onRehydrateStorage` callback to detect and log corruption.

## Recommended Fixes

### Tier 1: Low-effort, high-value safeguards

1. **Add no-op `migrate` functions to focusStore, learningStore, ideaStore** (5 min each)
   - Bump `version: 2 → 3` (or 1 → 2) on next schema change
   - Set `migrate: (state, fromVersion) => state as <T>` initially; future PRs fill in the logic
   - Ensures any breaking change is forced through an explicit migration pathway

   Example:
   ```typescript
   migrate: (persistedState, fromVersion) => {
     if (fromVersion < 2) {
       // Future migration logic here
     }
     return persistedState as { /* schema */ };
   }
   ```

2. **Add `onRehydrateStorage` callback** to all stores (10 min total)
   - Log rehydration errors and malformed data to console.warn or telemetry
   - Helps detect when users have corrupted localStorage

   ```typescript
   onRehydrateStorage: (state) => (rehydratedState, error) => {
     if (error) console.warn("hydration error:", error);
   }
   ```

### Tier 2: Medium-effort correctness improvements

3. **Derive `focusStore.project` from `projectId` at read time** (30 min)
   - Remove `project: string` from persisted state
   - Add selector: `const projectName = (state) => useProjectStore.getState().projects.find(p => p.id === state.projectId)?.name ?? "Unknown"`
   - Update UI to call selector instead of direct `focusStore.project`
   - Prevents orphaning of renamed/deleted projects in historical logs

4. **Cap `sessionLog` to recent 200 entries** (15 min)
   - In `submitReflection` and `dismissReflection`, slice to last 200: `sessionLog: [newEntry, ...s.sessionLog].slice(0, 200)`
   - Or add future "Archive" feature: offer export button, monthly cleanup

### Tier 3: Future-proofing (if building on this)

5. **Add schema validation at rehydration** (60 min)
   - Use `zod` or `superstruct` to validate rehydrated state
   - Reject malformed data and reset to defaults with a warning
   - Prevents type errors downstream

6. **Implement localStorage quota monitoring** (20 min)
   - Periodically check `navigator.storage.estimate()` 
   - Alert users if approaching 80% quota
   - Suggest archival/export of old sessionLog entries

## Refresh-Survival Trace

For each workflow, tracing the code to confirm whether data survives a page refresh:

### 1. Add project → refresh
- **Flow:** User calls `useProjectStore.upsertProject(newProject)` → sets `projects` array
- **Persisted:** Yes, via full state persistence (no `partialize`), into `focus-ladder.projects` key
- **After refresh:** New project list loads from localStorage
- **Survives refresh: YES**

### 2. Add task to project → refresh
- **Flow:** User calls `useProjectStore.addTask(projectId, { title, ... })` → mutates `projects[idx].tasks[]`
- **Persisted:** Yes, nested within the `projects` array in full state persistence
- **After refresh:** Task appears in project's task list
- **Survives refresh: YES**

### 3. Add note to project → refresh
- **Flow:** User calls `useProjectStore.addNote(projectId, { title, body, ... })` → mutates `projects[idx].notes[]`
- **Persisted:** Yes, nested within `projects` array
- **After refresh:** Note visible in project
- **Survives refresh: YES**

### 4. Add user paragraph to learning subtopic → refresh
- **Flow:** User calls `useLearningStore.appendUserParagraph(subtopicId, text)` → walks the tree, appends to `path.modules[m].subtopics[s].note.userParagraphs[]`
- **Persisted:** Yes, full `path` object is persisted (no `partialize`, no custom `merge`)
- **After refresh:** User paragraph still in the note
- **Survives refresh: YES**

### 5. Complete focus session (timer expires naturally) → refresh
- **Flow:** `tick()` fires, `remainingSec` reaches 0, calls `buildCompletion(state, true)` (completedNaturally = true), sets `pendingReflectionFor` and `status: "idle"`
- **Persisted state:** `sessionLog` is persisted; `pendingReflectionFor` is NOT (reset by `merge` callback on rehydration)
- **UI state after refresh:** Session reflection modal does NOT reappear (by design); `pendingReflectionFor` is null
- **But:** The session was NOT added to `sessionLog` yet; it only gets added after `submitReflection()` or `dismissReflection()` is called
- **Result:** If user refresh before submitting/dismissing reflection, the session is lost
- **Survives refresh: NO** (intentional — reflection modal is transient; session only persisted after reflection submitted)

### 6. End focus session early (user clicks "End") + skip reflection → refresh
- **Flow:** User calls `end()` → builds completion with `completedNaturally: false`, sets `pendingReflectionFor`, then calls `dismissReflection()` → adds to `sessionLog` with `reflection: null`
- **Persisted state:** Entry added to `sessionLog[0]` before refresh
- **After refresh:** Session appears in sessionLog
- **Survives refresh: YES**

### 7. Add idea → refresh
- **Flow:** User calls `useIdeaStore.addIdea(text, status)` → prepends to `ideas[]` array
- **Persisted:** Yes, via `partialize: { ideas }` into `focus-ladder.ideas` key
- **After refresh:** Idea list loads from localStorage with the new idea
- **Survives refresh: YES**

### 8. Change selected learning subtopic → refresh
- **Flow:** User calls `useLearningStore.selectSubtopic(id)` → sets `selectedSubtopicId` and `notesSubtopicId` to `id`
- **Persisted:** Yes, full state persisted (no `partialize`)
- **After refresh:** Same subtopic is selected and displayed
- **Survives refresh: YES**

---

**Summary of flows:**
- ✓ Projects, tasks, notes, ideas, learning selections, streaks, XP, tier: **survive refresh**
- ✗ Session reflection modal state: **intentionally does NOT survive** (by design to prevent stale prompts)
- ⚠ Incomplete session (timer running): **does NOT survive**; timer resets, session not recorded (you must reflect before closing tab)

