# Product Gap Analysis

Synthesis of `FEATURE_INVENTORY.md`, `PERSISTENCE_AUDIT.md`, `CODE_QUALITY_AUDIT.md`, and `ARCHITECTURE_MAP.md`. The audit verified each feature against actual code; this doc steps back and asks whether the *product* — the experience the user gets — is coherent.

## Current Product Shape

Focus Ladder is a single-user, browser-only "deep work + project tracking" app. Four routes (`/today`, `/projects`, `/projects/:id`, `/learning`, `/insights`) are all live and wired. Persistence is `localStorage` per Zustand store. The user can:

- Plan a day, run a Pomodoro-style focus timer with a tier/XP ladder, and log a reflection.
- Manage a list of projects and a per-project workspace (tasks, notes, links, manual time entries, history).
- Step through a hardcoded "Machine Learning" learning path, expand modules, select subtopics, and add user paragraphs to subtopic notes.
- Look back at a Session Log filtered by date range, project, and session shape.
- Capture random ideas in a parking lot.

That's a real product loop. The gaps below are about *what's still missing to make it feel real to a returning user a month later*.

## What Feels Real

These flows are end-to-end functional, persist correctly, and produce visible output the user cares about:

- **Focus timer → reflection → session log.** The whole loop works: start, countdown, natural completion or early end, reflection modal, XP award, tier advancement, log appended (`focusStore.ts`). XP/tier math is unit-tested.
- **Plan My Day → timer pre-filled.** Submitting the plan rewrites the active project, task, and `durationSec`; if idle, `remainingSec` is reset (`focusStore.ts:274-289`).
- **Projects CRUD.** Create, edit, archive, delete, plus task/note/link sub-CRUD and manual-time logging — all wired and persisted (`projectStore.ts`).
- **Insights filters.** Date range, quick filter, project filter all flow into a memoized `computeInsights` and the donut/trend/feed react accordingly (`useInsightsData.ts`).
- **Per-project session history.** `ProjectSessionsPanel` filters `focusStore.sessionLog` by `projectId` and renders a real timeline.

## What Still Feels Mocked

Things that look real but aren't, or that depend on demo seed data to look populated:

- **Greeting and avatar.** "Good morning, Alex." (`MainContent.tsx:17`), "Keep climbing." tagline (`Sidebar.tsx:260`), avatar = letter "A" on a gradient. No way to change any of this in-app. The greeting also doesn't reflect time of day — it's morning forever.
- **Streak counters.** `focusStreakDays` and `projectStreakDays` are persisted state with setters (`focusStore.ts:271-272`), but **nothing in the app advances them automatically**. They start at 0 and stay at 0 for any user who isn't manipulating store internals. The sidebar "Current Streaks" card is rendering a value that no codepath increments.
- **Deep Work hours tile.** Reads `useWeeklyStats().totalMinutes / 60`, which is correct — but flips back to 0 every Monday with no continuous "all-time" alternative.
- **Project weekly progress / weekly goal.** `Project.weeklyMinutes` is persisted on the project record but isn't recomputed from `sessionLog`. New sessions don't update the dashboard's "Active Projects" weekly bar; the bar reflects whatever was seeded or last manually set.
- **Notion sync card on Learning Path.** Renders a CTA explicitly disabled with "Coming soon" (`NotionSyncCard.tsx:45-63`). Same for image upload and code copy in Learning notes (`NotesPanel.tsx:108-116`, `NoteContent.tsx:54-63`).
- **Learning path content.** A single hardcoded "Machine Learning" path. There is no way to choose a different topic, import one, or even reorder modules in-app.
- **Project covers.** The image upload in `ProjectFormModal` works and writes a `dataUrl`, but large images go straight into localStorage and can blow the 5–10 MB quota (`PERSISTENCE_AUDIT.md` flags this).
- **Idea Parking Lot.** Functional CRUD, but ideas are end-of-line — there is no way to promote one into a project, link it to anything, or surface it later.

## Missing Core Workflows

Functionality that is *implied* by the UI but not present:

- **Streak maintenance.** No code computes "did the user complete a session today?" and increments `focusStreakDays`. The sidebar tile is a hollow promise.
- **Editing the active user.** No settings page, no name field, no avatar upload. `Sidebar.tsx`'s `<ProfileRow>` renders a `ChevronRight` that goes nowhere.
- **Editing or deleting a session log entry.** Sessions are append-only; mistakes are permanent. There's no "I forgot to start the timer — log a manual session" outside of `LogManualTimeModal`, which only logs to a project's `manualEntries`, not to `sessionLog`.
- **Exporting / importing data.** No way to move data between browsers, back it up, or recover from corrupted localStorage.
- **Promoting an idea → project.** The Idea Parking Lot is a notepad. The mockup invites a "graduate this idea" workflow that isn't built.
- **Tagging or grouping sessions across projects.** `CompletedSession.tags` is auto-populated but never user-editable. There is no tag filter on Insights.
- **Learning Path: marking a subtopic as complete.** `LearningSubtopic.status` exists and is rendered, but no UI mutates it. `appendUserParagraph` is the only learning store mutation.
- **Reminders / "you haven't done a session today".** No notification system, no banner, nothing.

## Confusing UX

- **Refresh mid-session silently kills the timer.** The intentional `merge` reset (`focusStore.ts:343-353`) means a user who refreshes mid-Pomodoro loses the timer with no warning. There's a defensible reason (no stale countdown), but no visible affordance for the user to resume — and if the reflection modal was open, the session is *gone* (no entry written).
- **Skipping reflection awards full XP.** `dismissReflection` calls the same `xpForSession` + `applyXpAward` as `submitReflection`. This is documented as intentional (`docs/ASSUMPTIONS.md`), but a new user is likely to assume "skip" means "this didn't count".
- **Decorative nav items.** "Focus Sessions", "Progress", "Inbox" with badge `7` (Sidebar) and "Focus", "Progress" (BottomBar) all render as clickable but go nowhere. The Inbox badge is a hardcoded `7` — it's a lie.
- **Bottom-bar Quick Add FAB.** Disabled, with "coming soon" tooltip. A center-positioned, prominent button that does nothing is a confidence killer.
- **"Plan My Day" overwrites the active session if the user is idle.** The behavior is correct (and probably what the user wants), but there's no "last plan" memory or undo if they meant to edit, not replace.
- **Inconsistent right-panel patterns.** Some pages use the AppShell's right-column slot (`/today` via `RightPanel`), others render their own `<aside>` (`/projects`, `/insights`, `/learning`). Behavior at `lg` vs `xl` breakpoints will differ slightly across pages.
- **No feedback on save.** Adding a project, task, note, or idea writes to localStorage immediately with no confirmation toast. Fine for power users, opaque for new ones.

## Data That Is Collected But Not Used

- **`SessionReflection.energyLevel`** is captured 1–5 but only `focusLevel` is rendered in `Insights` (`avgFocusRating`). Energy is never charted, surfaced, or filtered on.
- **`SessionReflection.reflection`** (free text) is captured and persisted but never displayed in the Insights feed — only the rating dots show.
- **`SessionReflection.completedPlanned`** is captured but doesn't influence any stat or filter.
- **`Project.events`** array (capped at 50) stores `task_added`, `task_completed`, `note_added`, `note_updated`, `session_completed`, `project_updated`. The Project Detail page renders a timeline panel, but it isn't used elsewhere — no global "recent activity across all projects" view.
- **`Project.tags`** are persisted on the model and editable in the form, but only some surfaces filter by tag.
- **`Project.manualEntries`** is appended to by `LogManualTimeModal`, but it's not aggregated into `weeklyMinutes`, doesn't appear in Insights, and the Project Detail's progress chart computes from `sessionLog` only.
- **`focusStore.flags`** (`focusMode`, `notificationsMuted`, `distractionsBlocked`) are persisted booleans the user can toggle, but the app does *nothing* with them — they're visual chrome.

## Data Users Can Add But Not Manage

- **Idea Parking Lot:** add and delete only. No edit, no status change, no archive. Three statuses ("Future Idea", "Maybe Later", "Incubating") are pickable on add but unchangeable after.
- **Project tasks:** add, toggle complete, remove. No edit (rename), no reorder, no due-date editing after creation, no priority.
- **Project notes:** full CRUD via `AddNoteModal`. This is the best-managed surface in the app.
- **Project links:** add and remove only. No edit, no reorder.
- **Learning Path notes:** append-only paragraphs. No edit, no delete.
- **Session log:** completely immutable from the UI. No edit, no delete, no merge.

## Most Important Gaps Before Beta

These are the ones that, if shipped as-is to a real beta user, would generate the most "is this a real product?" doubt:

1. **Streak counters that don't move.** Display state the app cannot update is worse than not displaying it. Either compute streaks from `sessionLog` or hide the tile.
2. **Refresh-mid-session loses everything silently.** Add at minimum a beforeunload prompt or persist an in-progress session to `localStorage` (with a "stale, resume?" check on rehydration).
3. **Decorative nav and Inbox-7 badge.** Either delete these placeholders or wire them. They actively undermine trust in everything else.
4. **No way to change "Alex" or anything user-identity related.** Add a minimal Settings page (name + tagline at least) so the dashboard greeting feels authored.
5. **Long-lived `sessionLog` orphan risk** (`CODE_QUALITY_AUDIT.md` risk #1). After a project rename, all historical sessions point at a stale name. Switch to projectId-keyed history before users have months of data.
6. **`focusStore` has no `migrate` function.** Any future schema bump corrupts user state. Add a no-op migrate now (10 minutes).
7. **Reflection data half-shown.** `energyLevel` and free-text reflection are captured but invisible in Insights. Either render them or stop collecting.
8. **Manual time entries don't aggregate.** A user who logs an hour manually expects it to show up in totals. It doesn't.

## Nice-to-Have Later

- Promote an idea → project flow.
- Custom learning paths (import / create / multiple paths).
- Session tagging UI + tag filter on Insights.
- Edit / delete a session log entry.
- Export / import (JSON download + upload).
- Dark/light theme toggle (currently dark only via `<html class="dark">`).
- Notion sync (already a UI placeholder).
- Real OS-level focus mode integration (currently visual flags only).
- Multi-device sync via a backend.
- Auth / multi-user.

## Does the App Actually Support…?

| Workflow | Verdict | Why |
|---|---|---|
| Planning focus work | **Yes** | `Plan My Day` writes a `DailyPlan` and pre-fills the timer (`PlanMyDayModal.tsx`, `focusStore.ts:274-289`). |
| Completing focus sessions | **Yes** | Timer runs, completes naturally or on End, fires reflection (`FocusSessionCard.tsx`, `focusStore.ts:241-264`). |
| Reflecting on sessions | **Yes** | 1–5 ratings, free text, "completed what I planned" all captured (`SessionReflectionModal.tsx`). |
| Viewing history | **Yes** | `/insights` page with filters and `ProjectSessionsPanel` per project (`useInsightsData.ts`, `ProjectSessionsPanel.tsx`). |
| Managing projects | **Yes** | Full CRUD on the gallery + detail page (`projectStore.ts` actions). |
| Managing project details (tasks/notes/links) | **Mostly** | Notes are full CRUD; tasks/links are add+toggle/remove only — no edit. |
| Following a learning path | **Partial** | Renders + persists selection + accepts user notes, but cannot mark progress, can't choose a different path. |
| Reducing context switching | **Partial** | Timer + flag strip + active-project pin help, but flags are cosmetic and there's no actual notification suppression. |
