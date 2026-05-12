# Focus Ladder Audit Docs

Post-PR audit of `claude/init-project-setup-bmmvA` at the point recent feature PRs (Insights, Learning Path, Projects gallery, Project detail) had landed. Each doc was verified against the actual code rather than restated from prior `docs/` content. See `PR_HISTORY_REVIEW.md` for the exact commit baseline.

## Audit Documents

- **[PR_HISTORY_REVIEW.md](./PR_HISTORY_REVIEW.md)** — Recent commits/PRs grouped by feature area, churn-heavy files, uncommitted-state check, and a short "risky changes" list.
- **[ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md)** — Routing, layout grid, four Zustand stores + derived hooks, persistence shape, data models, component organization, styling tokens, architectural risks, recommended cleanup.
- **[FEATURE_INVENTORY.md](./FEATURE_INVENTORY.md)** — Verified feature-by-feature table (status / route / data source / persistence / notes), explicit list of decorative/no-op interactions, and seed-data surfaces.
- **[PERSISTENCE_AUDIT.md](./PERSISTENCE_AUDIT.md)** — Per-store breakdown of localStorage keys, version numbers, `migrate`/`merge`, persisted vs reset slices, and an 8-flow refresh-survival trace.
- **[VERIFICATION_RESULTS.md](./VERIFICATION_RESULTS.md)** — Results of `npm install / lint / typecheck / test / build` plus a `vite preview` smoke test. No fixes were required.
- **[MANUAL_QA_CHECKLIST.md](./MANUAL_QA_CHECKLIST.md)** — Smoke / Today / Insights / Projects / Learning / Persistence / Responsive / a11y checklists. Interactive flows that couldn't be verified without a real browser are marked **NT-NB** with a code-trace conclusion.
- **[CODE_QUALITY_AUDIT.md](./CODE_QUALITY_AUDIT.md)** — Overall grade, what's well built, biggest risks, smells, duplications, dead code, type/state/persistence/styling issues, refactor list ordered cheap → expensive, and a "do not refactor yet" list.
- **[PRODUCT_GAPS.md](./PRODUCT_GAPS.md)** — Synthesis: what feels real, what still feels mocked, missing core workflows, confusing UX, captured-but-unused data, and an explicit "does the app actually support X?" table.
- **[PRIORITIZED_BACKLOG.md](./PRIORITIZED_BACKLOG.md)** — P0 / P1 / P2 / P3 backlog with title, why-it-matters, acceptance criteria, related files for every item.
- **[NEXT_STEPS_PLAN.md](./NEXT_STEPS_PLAN.md)** — Three concrete implementation slices (with files, acceptance criteria, risks), what *not* to build yet, and a definition of done for the next milestone.

## How These Docs Were Produced

- `PR_HISTORY_REVIEW.md`, `VERIFICATION_RESULTS.md`, `MANUAL_QA_CHECKLIST.md`, `PRODUCT_GAPS.md`, `PRIORITIZED_BACKLOG.md`, `NEXT_STEPS_PLAN.md` were written directly from primary inspection (git, npm scripts, code reading, synthesis of the other audit docs).
- `ARCHITECTURE_MAP.md`, `FEATURE_INVENTORY.md`, `PERSISTENCE_AUDIT.md`, `CODE_QUALITY_AUDIT.md` were each produced by a focused Explore subagent run against well-defined scopes; every claim cites a `path:line`.
- No new application code was written. The only repo change outside `docs/` was the addition of `CLAUDE.md` at the repo root.

## Where the Pre-PR Baseline Lives

The repo's older engineering notes are still in `docs/` (one level up):

- `docs/ASSUMPTIONS.md`, `docs/FEATURE_STATUS.md`, `docs/CODE_QUALITY_REVIEW.md`, `docs/IMPLEMENTATION_AUDIT.md`, `docs/MOCKUP_ALIGNMENT.md`, `docs/BACKLOG.md`, `docs/NEXT_STEPS.md`, `docs/OPEN_QUESTIONS.md`.

They predate the four Phase-B PRs and should be cross-checked against, not preferred over, the documents in this folder.
