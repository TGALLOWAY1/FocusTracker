# Next Steps

## Recommended Immediate Path

The product is roughly **90% feature-complete for the Today view** and well architected. The single biggest leverage point is making the dashboard *react to real user activity*. Today, the right-column stats and the tier ladder are demo data — they don't change when a user actually completes a session. Closing that loop is what turns this from "polished landing page" into "useful tool".

Order of operations:

1. Land the verification infra (Step 7 of the audit — scripts, eslint, vitest, one smoke test) so future changes have a safety net.
2. Wire the live-data loop: stats derived from `sessionLog`, project cards clickable, XP awarded on session completion, tier auto-advance.
3. Surface session history so users can see their own data.
4. Only then start on additional views, settings, or mobile.

Resist the urge to start with cosmetic mockup-parity work (photographic backdrop, avatar image). The current visuals are good enough and shouldn't move until the data model behind them is real.

## Next 3 Implementation Slices

### Slice 1 — Make the dashboard live (P0)

**Goal:** Completing a real session changes the dashboard.

**Scope**
- Derive `FocusStatsPanel` data from `focusStore.sessionLog`. Add `useWeeklyStats()` hook that buckets the last 7 days. Keep `WEEK_STATS` as the empty-state default.
- Award XP in `submitReflection` (and possibly `dismissReflection`) based on `actualDurationSec`. Decide policy via `OPEN_QUESTIONS.md#1-3`.
- Auto-advance `currentTierId` when `xp >= tier.xpToNext`. Decide overflow behavior via `OPEN_QUESTIONS.md#4`.
- Make `ActiveProjectsPanel` cards clickable — on click, set `focusStore.project` (and ideally a future `projectId`) and scroll the timer into view.
- Remove or wire the three decorative buttons: "View All" (`FocusLadderPanel`), "Manage" (`ActiveProjectsPanel`), and the disabled Quick Add FAB (`BottomBar`).

**Definition of Done**
- Completing a session bumps "Sessions" by 1 in the right panel, increments the relevant day's bar, awards XP, and visibly progresses (or doesn't, depending on policy) the tier card.
- Clicking a project row preloads the focus session with that project.
- No clickable-looking element on the dashboard is a no-op.

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
