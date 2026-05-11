# Assumptions

These are constraints the implementation currently bakes in. Any of them can be revisited, but the codebase as it stands assumes them.

## Data and Persistence

- **Single user, single device.** No authentication; nothing syncs across devices. Each browser profile is its own world.
- **Persistence is browser `localStorage` only.** Three keys: `focus-ladder.focus`, `focus-ladder.ideas`, `focus-ladder.projects`. Clearing site data resets everything.
- **No schema migration.** All three Zustand stores set `version: 1` but no `migrate` function is defined. Any change to persisted shape silently merges old data, which may produce stale or broken fields.
- **Seed data only on first load.** `ideaStore` seeds 3 ideas with relative `createdAt` timestamps (Now − 2h / 26h / 50h, so the relative-date display reads "Today / Yesterday / 2d ago"). `projectStore` seeds 3 projects (Harmonia EP / Machine Learning Path / Synapse). `focusStore` seeds tier 3, 1250 XP, focus streak 14, project streak 7. These are demo defaults, not real user state.
- **Stats are demo data.** `WEEK_STATS` in `src/data/focusStats.ts` is hardcoded. `FocusStatsPanel` reads from this constant, not from completed sessions. Tracked in `FEATURE_STATUS.md` and `BACKLOG.md`.
- **Local timezone, no DST handling.** Relative dates (`utils/date.ts`) and any weekly bucketing happen in the user's local time.

## Identity and Personalization

- **Username is hardcoded to "Alex".** Appears in the greeting (`MainContent.tsx:17`) and the profile row (`Sidebar.tsx:233`). No way to change it in-app.
- **Greeting is morning-only.** "Good morning, Alex." regardless of time of day.
- **Avatar is a letter "A" on a gradient.** Not editable.
- **No multi-user model.** Stores assume one identity per browser.

## Sessions and Timers

- **Default session length is 35 minutes** (`focusStore.ts:7`). Override via the Plan-My-Day modal (which writes `durationSec` from `plannedDurationMin * 60`).
- **Break is always "Short Break 5 min"** (`focusStore.ts:122`). No long-break logic, no automatic transition to the break.
- **Tier ladder is fixed at 6 tiers.** 10/20/35/50/75/90+ minutes, with hardcoded XP thresholds. Not customizable in-app.
- **Tier does not auto-advance.** XP isn't awarded by any action today; `currentTierId` is only changed via `setTier()`, which no UI calls. Both gaps tracked in BACKLOG (#4).
- **Status flags are visual only.** "Focus Mode On", "Notifications Muted", "Distractions Blocked" (`FocusSessionCard.tsx:170-194`) reflect store flags but the app does not actually mute notifications, block sites, or change OS focus state.
- **Refresh mid-session resets to idle.** Intentional, via `focusStore.merge` (see `IMPLEMENTATION_AUDIT.md`). Users will lose an in-progress timer if they refresh — but they will not accidentally resume a stale one.

## Sessions: what counts

- **A session is "completed naturally"** when `tick()` reaches `remainingSec <= 1` (`focusStore.ts:151`). The session record uses `actualDurationSec = plannedDurationSec`.
- **An "ended early" session** is anything where the user clicked End Session. `actualDurationSec` is the elapsed time so far.
- **Both natural completion and early-end trigger the reflection modal.** Skipping the modal still records the session with `reflection: null`.
- **No partial-credit policy.** A 5-minute session and a 50-minute session both currently log identically except for `actualDurationSec`. There is no policy yet on what "counts" for streaks, XP, or the completion-rate stat. Tracked in `OPEN_QUESTIONS.md`.

## Architecture

- **No router.** All views are decorative; only the Today dashboard exists.
- **No backend.** No HTTP calls anywhere in the codebase.
- **No AI / no auto-suggestion.** Plan-My-Day is hand-entered.
- **No analytics, no telemetry.**
- **No build-time secrets, no env vars.** `.env` is gitignored but unused.
- **Desktop-first.** `lg` breakpoint is the design target. Mobile collapses to MainContent only.
