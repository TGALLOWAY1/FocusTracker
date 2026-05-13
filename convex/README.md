# Convex backend

This directory holds the Convex schema and functions for the persistence
backup layer. See `docs/PERSISTENCE.md` for the design overview and
operator setup (running `npx convex dev`, populating `VITE_CONVEX_URL`).

- `schema.ts` — single `snapshots` table, keyed by Zustand store name.
- `snapshots.ts` — `getMany` (cold-start hydration) and `put` (debounced
  push from the client). Both are unauthenticated; this deployment is a
  single shared account by design.
- `_generated/` — created by `npx convex dev`. Do not edit. Do not commit
  to version control if the deployment URL is sensitive.
