# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server.
- `npm run build` — type-checks via `tsc -b` then bundles with Vite.
- `npm run typecheck` — `tsc --noEmit -p tsconfig.app.json`. Faster than `build` when iterating.
- `npm run lint` — ESLint flat config (`eslint.config.js`).
- `npm test` — Vitest, single run (no watch). Tests live as `src/**/*.test.{ts,tsx}` and execute in the `node` environment (see `vitest.config.ts`).
- Single test file: `npx vitest run src/state/focusStore.test.ts`. Filter by name: `npx vitest run -t "applyXpAward"`.

## Architecture

**Single-page React 18 + Vite + TypeScript app**, strict TS. Entry: `src/main.tsx` → `src/App.tsx` → `src/components/layout/AppShell.tsx`. `AppShell` mounts `BrowserRouter` and a 3-column grid (Sidebar / routed page / right panel) over a fixed `BottomBar`. Routes: `/today`, `/projects`, `/projects/:projectId`, `/learning`, `/insights`. Below the `lg` breakpoint the layout collapses to the main column only.

**State lives in Zustand stores under `src/state/`** — one store per domain, all persisted via `persist` + `createJSONStorage(localStorage)`:

| Store | Storage key | Role |
|---|---|---|
| `focusStore` | `focus-ladder.focus` | timer, tier ladder, XP, daily plan, `sessionLog` |
| `projectStore` | `focus-ladder.projects` | projects with tasks/notes/links/events; `version: 3` with a real `migrate` |
| `learningStore` | `focus-ladder.learning` | learning path, expanded modules, selected subtopic, user note paragraphs |
| `ideaStore` | `focus-ladder.ideas` | parking-lot ideas |

Stores never import each other's internals. Cross-store reads use `useXStore.getState()` (e.g. `focusStore` resolves a project's `activityCategory` from `projectStore` when building a `CompletedSession`).

**Derived data is exposed as hooks colocated with stores** — `useWeeklyStats.ts`, `useInsightsData.ts`, `useProjectStats.ts`. Each derivation function (`bucketWeeklyStats`, `computeInsights`, etc.) is exported separately so its `.test.ts` peer can hit it without React. Stats components must read these hooks rather than re-derive from `sessionLog` inline.

**`focusStore.sessionLog` is the canonical record of completed work.** It feeds the right-column stats panel, the Insights page, and per-project totals. A session is appended on *both* `submitReflection` and `dismissReflection` — skipping reflection is a UX opt-out, not a forfeit. XP is awarded in both paths via `xpForSession` + `applyXpAward`. `CompletedSession` carries `activityCategory`, `sessionType` (`deep` / `light` / `learning`), `completedNaturally`, and pre-built `tags`.

**Hydration is intentionally lossy for transient state.** `focusStore`'s custom `merge` (bottom of `focusStore.ts`) forces `status: "idle"`, resets `remainingSec` to `durationSec`, and clears `pendingReflectionFor`. A page refresh mid-session must never resume a stale countdown or re-pop a reflection modal. Preserve this when changing the persist config.

**When you change a persisted store's shape, bump `version` and add a `migrate`.** `projectStore` is the example to copy — its `migrate` upgrades legacy v2 records to the v3 shape. Stores without a real migration (focus / learning / ideas) currently rely on shape compatibility; introducing a breaking change without a migrate will silently corrupt user data.

**A Convex backup layer mirrors each store's persisted payload remotely.** See `docs/PERSISTENCE.md`. `src/sync/snapshotSync.ts` is the pure logic (debounced push, hydrate-if-missing); `src/sync/convexBackend.ts` is the Convex adapter; `src/sync/installSync.ts` wires Zustand `subscribe` to a push scheduler. The wire format is the verbatim Zustand payload — `migrate`/`merge` remain the source of truth for shape. `localStorage` is primary; the backend only fills keys that are absent locally at cold start. Without `VITE_CONVEX_URL` the layer no-ops and the app falls back to localStorage-only.

**Activity categories are a shared enum** in `src/data/activityCategories.ts`. `ACTIVITY_CATEGORIES` carries label, hex `color` (used by SVG charts), and Tailwind `bgClass` / `textClass`. Use `CATEGORY_ORDER` for any deterministic iteration over categories.

**Design tokens are in `tailwind.config.ts`** — custom palette (`bg.*`, `text.*`, `brand.*`, `accent.*`, `border.*`) and the `focusGlow` shadow. Prefer these tokens over arbitrary values; new colors should be added to the config rather than inlined as `bg-[#…]`.

**Shared UI primitives in `src/components/ui/`** (`Card`, `Modal`, `ProgressRing`) are reused across feature panels. `Modal` already handles portal rendering, `role="dialog"` / `aria-modal`, Escape to close, backdrop-click to close, and body-scroll lock — don't reimplement.

## Conventions to preserve

- `eslint.config.js` downgrades `react-hooks/set-state-in-effect` to a warning because of existing modal form-reset patterns in `PlanMyDayModal` / `SessionReflectionModal`. Don't expand reliance on it in new code.
- `tsconfig.app.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Keep the codebase free of `any` and unused symbols — `tsc -b` runs as part of `npm run build`.
- Browser-only app. The flag strip ("Notifications Muted", "Distractions Blocked") is **visual only**; the app does not touch OS focus state. See `docs/ASSUMPTIONS.md`.

## Further reading

`docs/` contains living engineering notes maintained alongside the code:

- `docs/ASSUMPTIONS.md` — constraints baked into the implementation.
- `docs/FEATURE_STATUS.md` — feature-by-feature status (predates the most recent PRs; cross-check with `docs/audit/FEATURE_INVENTORY.md` if present).
- `docs/CODE_QUALITY_REVIEW.md` — known smells and refactor list.
- `docs/IMPLEMENTATION_AUDIT.md`, `docs/MOCKUP_ALIGNMENT.md`, `docs/BACKLOG.md`, `docs/NEXT_STEPS.md`, `docs/OPEN_QUESTIONS.md` — supporting product/engineering notes.
- `docs/audit/` — post-PR verification docs (architecture map, feature inventory, persistence audit, code quality audit, manual QA, verification results, product gaps, prioritized backlog, next-steps plan).

Read the relevant doc before non-trivial work in that area.
