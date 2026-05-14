# PR History Review

Snapshot taken on `claude/init-project-setup-bmmvA` (HEAD `50107bc`, branched from `main` at `22aa62a`). All git commands run from `/home/user/FocusTracker`.

## Recent Commits / PRs Reviewed

`git log --oneline -25` shows two distinct phases of work:

**Phase A — initial dashboard build (10 commits, all 2026-05-11).** A linear `phase-1` … `phase-10` series authored by Claude that built the Today dashboard end-to-end (shell → timer → ladder → projects panel → ideas → stats → sidebar wiring → plan-my-day → reflection → localStorage). Followed by `chore: add typecheck, lint, and test scripts` and `docs: implementation audit, mockup alignment, and product artifacts`. These commits are NOT wrapped in PRs in the local log; they appear as direct commits.

**Phase B — feature pages, four PRs (2026-05-11 → 2026-05-12).** Each PR = one merge commit + one feat commit:

| PR | Merge | Feat commit | Subject |
|---|---|---|---|
| #2 | `ade42f9` | — | "assess focus ladder" — appears to wrap the Phase A audit work |
| #3 | `f60e510` | `c757fab` | `feat(slice-1): make the dashboard live` |
| #4 | `1ff6dd7` | `e8233b9` | `feat(insights): add Session Log / Reflection History view` |
| #5 | `9fb184e` | `28310b6` | `feat(learning): add Learning Path page with modules, notes, and persistence` |
| #6 | `c60f440` | `b1d5c0e` | `feat(projects): add Projects gallery page with persistent data` |
| #7 | `22aa62a` | `4d881f8` | `feat(projects): add Project Detail Page with tasks, notes, links, sessions` |

The current branch (`claude/init-project-setup-bmmvA`) sits one commit ahead of origin/main with the `docs: add CLAUDE.md` commit (`50107bc`) added during this audit.

## Major Feature Areas Added

Per-PR diffstat (against the parent commit, `src/` only):

- **PR #3 — "make the dashboard live"** (`c757fab`): wired previously decorative dashboard panels to real store-derived data. Touched `MainContent.tsx`, `Sidebar.tsx`, `RightPanel.tsx`, `BottomBar.tsx`, `FocusStatsPanel.tsx`, `ActiveProjectsPanel.tsx`. Added `src/state/useWeeklyStats.{ts,test.ts}`, `src/utils/{date.ts,id.ts,time.ts}`. This is the foundational work the later PRs build on.
- **PR #4 — Session Log / Insights** (`e8233b9`, +1,693 / −66 lines): added the `/insights` route and the entire `src/components/insights/` tree (11 files including `InsightsPage.tsx`, `SessionsFeed.tsx`, `SessionRow.tsx`, `SummaryCards.tsx`, `CategoryDonut*.tsx`, `CategoryTrend*.tsx`, `InsightsFilters.tsx`, `InsightsEmptyState.tsx`, `QuickFiltersPanel.tsx`). Added `src/state/useInsightsData.{ts,test.ts}` (278 + 235 lines) and `src/data/activityCategories.ts`. Extended `focusStore.ts` to record `activityCategory`, `sessionType`, `tags` on each `CompletedSession`.
- **PR #5 — Learning Path** (`28310b6`, +1,381 / −4 lines): added the `/learning` route, the `src/components/learning/` tree (10 files), the new `learningStore.ts` (102 lines, persisted as `focus-ladder.learning`), and the `MACHINE_LEARNING_PATH` seed in `src/data/learningPath.ts` (280 lines).
- **PR #6 — Projects Gallery** (`b1d5c0e`, +2,335 / −24 lines): added the `/projects` listing route, `src/components/projects/` (10 files: `ProjectsPage.tsx`, `ProjectCard.tsx`, `ProjectListRow.tsx`, `ProjectFormModal.tsx`, `ProjectsFilterBar.tsx`, `ProjectsSummaryCards.tsx`, `ProjectsQuickFiltersPanel.tsx`, `ProjectFocusDonutPanel.tsx`, `StayConsistentPanel.tsx`, `LogManualTimeModal.tsx`). Bumped `projectStore` to v3 with a real `migrate`. Added `src/state/useProjectStats.{ts,test.ts}` and `src/utils/image.ts`.
- **PR #7 — Project Detail** (`4d881f8`, +2,207 / −17 lines): added the `/projects/:projectId` route and `src/components/projects/detail/` (11 files: `ProjectDetailPage.tsx`, `ProjectHero.tsx`, `ProjectOverviewCard.tsx`, `ProjectProgressChart.tsx`, `ProjectTagsCard.tsx`, `ProjectLinksCard.tsx`, `ProjectNotesPanel.tsx`, `ProjectTasksPanel.tsx`, `ProjectSessionsPanel.tsx`, `ProjectTabs.tsx`, `AddNoteModal.tsx`). Extended the `Project` type in `src/data/projects.ts` (+282 lines) with tasks/notes/links/events/manual-entries. Extended `projectStore.ts` (+155 lines) with the corresponding actions.

## Files With Heavy Churn

`git log --pretty=format: --name-only --since="3 months ago" | sort | uniq -c | sort -rn` (top of list, non-zero entries only):

| Touches | File |
|---|---|
| 8 | `src/state/focusStore.ts` |
| 5 | `src/data/projects.ts` |
| 5 | `src/components/layout/RightPanel.tsx` |
| 5 | `src/components/layout/MainContent.tsx` |
| 5 | `src/components/layout/AppShell.tsx` |
| 4 | `src/state/projectStore.ts`, `src/data/navItems.ts`, `src/components/layout/{Sidebar,BottomBar}.tsx`, `src/components/dashboard/ActiveProjectsPanel.tsx` |
| 3 | `src/state/{ideaStore,focusStore.test}.ts`, `package.json`, `package-lock.json` |

`focusStore.ts` is the central churn site — every feature PR has touched it. `AppShell.tsx`, `MainContent.tsx`, `RightPanel.tsx` churn reflects the four route additions and the right-column layout migrating from "today only" to "per page". `projects.ts` churn reflects the model expanding from a flat record (PR #6 v2→v3 migration) to a record-with-children (PR #7).

## Uncommitted Changes

`git status --short` is clean as of this audit (after the `docs: add CLAUDE.md` commit). No stashed changes (`git stash list` is empty).

## Risky or Suspicious Changes

- **`focusStore.ts` was touched 8 times** but its persist `version` was only bumped from 1 to 2, and there is still no `migrate` function. Any PR that altered the persisted shape (e.g. PR #4 added new fields onto `CompletedSession`) silently merged into existing localStorage. This is documented further in `PERSISTENCE_AUDIT.md`.
- **PR #5 introduced `learningStore` as `version: 1` with no `migrate`** — same exposure for the next shape change.
- **PR #6 vs PR #7 model evolution.** PR #6 bumped `projectStore` from v2 → v3 with a `migrate` for the *flat* shape. PR #7 then extended `Project` with `tasks`, `notes`, `links`, `events`, `manualEntries` *without* bumping the version or extending the migrate. Existing v3 records hydrated by users on v3 will simply have those arrays as `undefined` and the code uses `?? []` everywhere — which works, but the migrate is now incomplete relative to the current shape. Worth a follow-up bump to v4 with a backfill.
- **Phase A series committed directly to a branch** (no PR for phases 1–10). They predate the merge-PR workflow that PRs #2–#7 use; not a code risk, but means there's no PR description to cross-reference for those commits.
- **All non-merge commits are authored "Claude"** with `TJ Galloway` only on the merge commits. Indicates the repo is being driven entirely by Claude Code with the human in a reviewer/merger role — keep that in mind when interpreting commit messages, which may overstate completeness.
- **No tag, no release, no `CHANGELOG.md`.** Versioning is ad hoc.

## Notes

- All four feature PRs are large (1.4k–2.3k lines each) and each lands as a single feat commit. Reviewing them after the fact requires reading the diff in full — the commit messages are short.
- Tests are present in `src/state/` only — see `focusStore.test.ts`, `useInsightsData.test.ts`, `useProjectStats.test.ts`, `useWeeklyStats.test.ts`. No component tests, no E2E. 32 tests total, all green at HEAD.
- Build, typecheck, lint, and test all pass at HEAD with no required fixes (see `VERIFICATION_RESULTS.md`). Lint emits 3 warnings for the known `react-hooks/set-state-in-effect` pattern in `PlanMyDayModal.tsx`, `SessionReflectionModal.tsx`, and `AddNoteModal.tsx` — the rule is intentionally downgraded in `eslint.config.js`.
