# Next Steps

## Recommended Immediate Path

Slice 1 ("make the dashboard live") is done — completing a real session now drives the weekly chart, totals, completion rate, XP, and tier progression. The next visible gap is **the session history view**: reflections accumulate in `focusStore.sessionLog` but the user can't see them anywhere. That's Slice 2.

Order of operations:

1. ~~Land the verification infra~~ ✅
2. ~~Wire the live-data loop~~ ✅
3. Surface session history so users can see their own data (Slice 2 below).
4. Only then start on additional views, settings, or mobile.

Resist the urge to start with cosmetic mockup-parity work (photographic backdrop, avatar image). The current visuals are good enough and shouldn't move until the data model behind them is real.

## Next 3 Implementation Slices

### Slice 1 — Make the dashboard live (P0) ✅ Done

Shipped on `claude/systematic-audit-driven-dev-BEInu`:

- `bucketWeeklyStats` + `useWeeklyStats` derive Focus Stats from `sessionLog`. `WEEK_STATS` deleted. Sidebar deep-work tile reads the same hook.
- XP policy: `xpForSession` = `min(60, mins) + 3 × max(0, mins − 60) + (completedNaturally ? 5 : 0)`. Awarded on **both** `submitReflection` and `dismissReflection` (skipping reflection is not a forfeit).
- `applyXpAward` rolls overflow XP into the next tier; advances stop at Tier 6 (`xpToNext = Infinity`).
- `ActiveProjectsPanel` rows are real `<button>`s that call `setProject` and smooth-scroll to `#focus-session-card`.
- "View All" and "Manage" removed. Quick Add FAB stays visibly disabled.
- Seed XP/tier/streaks reset to 0/1/0/0 so the ladder advances honestly from a fresh install.
- Default `status` flipped from `"running"` to `"idle"` (audit fix).
- 17 tests passing — `xpForSession` curve, `applyXpAward` rollover (including peak-tier and multi-tier walks), `submit/dismissReflection` XP+tier integration, `bucketWeeklyStats` empty/bucketed/exclude-prior-week/maxY-growth.

### Slice 2 — Make the data visible (P1)

**Goal:** Users can see their own session history.

**Scope**
- Add a "Recent Sessions" view (either a panel in the right column, replacing or augmenting the existing layout, or a new minimal view triggered from a nav item). Lists `sessionLog` entries with project, duration, completion flag, and a one-line reflection summary.
- Add a `currentView` to a small UI store (no router yet) so at least one nav item leads somewhere. Wire `Today` and `Insights` (or whichever name fits) — that's enough to validate the navigation model.
- Replace `focusStore.project` (string) with `projectId` before the user accumulates real data that would break on rename. Add a v2 persist migrate.

**Definition of Done**
- A user can complete 3 sessions, navigate to the history view, and see all 3.
- A user can rename a project and previous sessions still link to it.

### Slice 3 — Editable settings + project CRUD (P2)

**Goal:** No more hardcoded user state.

**Scope**
- Settings modal from the profile row chevron (`Sidebar.tsx:236`). Fields: display name, default session duration, break duration. All write to a settings store; `MainContent` greeting and the focus card defaults read from it.
- Time-of-day-aware greeting ("Good morning/afternoon/evening").
- Project CRUD: "Manage" opens a modal that lists projects with rename / color / weekly goal / add / delete.
- Small mockup-parity tweaks (`Target` → `Zap`, optional thicker timer ring).

**Definition of Done**
- A user can change their name and watch the dashboard update.
- A user can rename "Harmonia EP" → "Harmonia LP" without orphaning the session history.

## What Not To Work On Yet

- **Authentication, accounts, cloud sync.** Out of scope for the single-device target. Adding any of these now will leak architecture into the wrong places.
- **AI-generated session suggestions.** Tempting and easy to demo, but premature without history.
- **Real distraction blocking (sites, OS focus mode).** Either rename the flag chips to "intent" or treat this as a P3 stretch — don't half-build it.
- **Notifications (Web Notifications API).** Permission flows interact badly with the current dev loop; add once Slice 2 is shipped.
- **Multi-day planning, weekly review screens.** Requires the history data to be visible first (Slice 2).
- **Photographic timer backdrop.** Current SVG is acceptable; revisit only after brand direction is set.
- **A real router.** Hold off until at least 2 views exist and a UI-store `currentView` is no longer enough.
- **Mobile redesign.** The desktop layout is the design target. Mobile is acceptable as MainContent-only until the user base demands more.

## Definition of Done for the Next Milestone

A user who installs the app fresh, runs three 35-minute sessions over three days, and submits a reflection after each, should see:

- Today's stats reflect their three sessions (total time, count, completion rate).
- The weekly bar chart show three bars (or as appropriate for their actual day).
- XP that has accumulated and visibly moved the sidebar tier-card progress bar.
- A history list of those three sessions with their reflection summary.
- A project they renamed mid-week still correctly linked to all three past sessions.
- No buttons on the dashboard that do nothing.

That's the bar for "real product, not demo."
