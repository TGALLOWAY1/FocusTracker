# Persistence backup (Convex)

Each Zustand store under `src/state/` is persisted to `localStorage` via
Zustand's `persist` middleware. That gives durability across page reloads on a
single browser, but not across cache clears, devices, or browser profiles.

The Convex backup layer wraps those four stores with a remote backup so the
data survives any of those events.

## Design

- **localStorage stays primary.** All reads come from local Zustand state; the
  app continues to work entirely offline. Convex is never on the read path
  except at cold start.
- **Backend is a write-through backup.** Each store's persisted slice is
  pushed to Convex as a raw JSON snapshot, debounced 2s after the last change.
- **Cold-start hydration is opt-in.** On boot, `hydrateFromBackend()` fetches
  only the snapshots whose `localStorage` key is currently absent. Keys that
  already exist locally are left untouched — local data is never clobbered by
  the remote.
- **Single shared account.** No auth. Anyone with the deployment URL reads and
  writes the same snapshots. Suitable for a personal app with one user across
  devices; **do not deploy publicly with this configuration**.

The wire format is the verbatim Zustand payload (`{ "state": ..., "version": N }`).
The backend treats `payload` as an opaque string, so the `migrate`/`merge`
logic inside each store continues to own schema evolution exactly as before.

## Files

| Path | Role |
|---|---|
| `convex/schema.ts` | Single `snapshots` table, indexed by store name. |
| `convex/snapshots.ts` | `getMany` (hydrate) and `put` (push) functions. |
| `src/sync/snapshotSync.ts` | Pure logic: debounced push scheduler, hydration helper. No Convex imports — testable in node. |
| `src/sync/convexBackend.ts` | Convex glue. Reads `VITE_CONVEX_URL` and builds the `SnapshotBackend` adapter. |
| `src/sync/installSync.ts` | Wires Zustand subscriptions to the scheduler. Idempotent. |
| `src/main.tsx` | Dynamic-imports the sync module, awaits hydration, then mounts App. |

## Setup (first-time)

1. Install the Convex CLI dep (already in `package.json`): `npm install`.
2. Run `npx convex dev` from the repo root. It will:
   - Prompt for a Convex login the first time (opens browser).
   - Create a development deployment and write its URL to `.env.local`
     (`VITE_CONVEX_URL=...`).
   - Generate `convex/_generated/` (gitignored).
   - Watch `convex/*.ts` and push function changes live.
3. Leave `npx convex dev` running, then in another shell run `npm run dev` as
   usual.

To run the app **without** the backup layer, leave `VITE_CONVEX_URL` unset.
Sync becomes a no-op and the app behaves exactly as it did before this layer
was added.

## Limitations of the "backup" sync model

This is intentionally a simple backup, not a real cross-device sync engine:

- **No conflict resolution.** Last writer wins per-store. If you edit on
  device A while device B has unsynced edits, whichever pushes last
  overwrites the snapshot in Convex.
- **No subscriptions.** A change on device A is not pushed to device B in
  real time. Device B will only see it on a cold start with empty
  localStorage (e.g. after clearing site data).
- **No "manual restore from backup" UI.** A user who wants to discard local
  state in favor of the remote snapshot must clear site data first, then
  reload — at which point cold-start hydration kicks in.

If those become real pain points, the next step is to swap the HTTP client
for `ConvexReactClient` and subscribe to the snapshots table — Convex pushes
updates over a WebSocket out of the box.
