// Pure sync logic for the Convex backup layer. No imports from `convex/*`
// here — the backend implementation is injected via `SnapshotBackend` so
// this module is testable in the node environment without Convex stubs.
//
// Storage model: each Zustand store has a `name` (e.g. "focus-ladder.focus").
// We push the raw localStorage payload — Zustand's `{ "state": ..., "version": N }`
// envelope — verbatim, so the persist `migrate`/`merge` contract continues to
// own shape evolution. The backend treats `payload` as an opaque string.

export type Snapshot = {
  key: string;
  payload: string;
  updatedAt: number;
};

export type SnapshotBackend = {
  fetchSnapshots(keys: string[]): Promise<Snapshot[]>;
  pushSnapshot(snapshot: Snapshot): Promise<void>;
};

// The four persisted Zustand stores. Matches the `name` field in each store's
// `persist({ name: ... })` config.
export const STORE_KEYS = [
  "focus-ladder.focus",
  "focus-ladder.projects",
  "focus-ladder.learning",
  "focus-ladder.ideas",
] as const;

export type StoreKey = (typeof STORE_KEYS)[number];

export const DEFAULT_PUSH_DEBOUNCE_MS = 2000;

// Pulls from the backend for any localStorage keys that are currently empty
// and writes them into storage. Returns the keys that were hydrated.
//
// Called once at boot, before stores hydrate. By only filling absent keys, we
// preserve the "localStorage primary" model: existing local state is never
// overwritten by the remote backup.
export async function hydrateMissingSnapshots(
  backend: SnapshotBackend,
  keys: readonly string[],
  storage: Pick<Storage, "getItem" | "setItem">
): Promise<string[]> {
  const missing = keys.filter((k) => storage.getItem(k) === null);
  if (missing.length === 0) return [];
  const snapshots = await backend.fetchSnapshots(missing);
  for (const s of snapshots) {
    storage.setItem(s.key, s.payload);
  }
  return snapshots.map((s) => s.key);
}

export type PushScheduler = {
  schedule: (key: string) => void;
  flush: () => Promise<void>;
  dispose: () => void;
};

type PushSchedulerOptions = {
  debounceMs?: number;
  storage?: Pick<Storage, "getItem">;
  now?: () => number;
  onError?: (key: string, err: unknown) => void;
};

// Debounced, per-key push pipeline. `schedule(key)` resets a timer for that
// key; when the timer fires we read the current payload from storage and
// push to the backend. Per-key (not global) so a flurry of changes in one
// store doesn't starve pushes from another.
//
// `flush` awaits any pending pushes — used in tests to make assertions
// deterministic. `dispose` cancels pending timers (e.g. on shutdown).
export function createPushScheduler(
  backend: SnapshotBackend,
  options: PushSchedulerOptions = {}
): PushScheduler {
  const debounceMs = options.debounceMs ?? DEFAULT_PUSH_DEBOUNCE_MS;
  const storage = options.storage ?? (globalThis.localStorage as Storage);
  const now = options.now ?? (() => Date.now());
  const onError =
    options.onError ??
    ((key, err) =>
      console.error(`[snapshotSync] push failed for ${key}`, err));

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const inflight = new Map<string, Promise<void>>();
  // Skip pushing a payload identical to the one we last sent. Zustand
  // `subscribe` fires on every setState (including transient ticks), so
  // many scheduled pushes find an unchanged persisted slice.
  const lastPushed = new Map<string, string>();

  function doPush(key: string): Promise<void> {
    const payload = storage.getItem(key);
    if (payload === null) return Promise.resolve();
    if (lastPushed.get(key) === payload) return Promise.resolve();
    lastPushed.set(key, payload);
    const p = backend
      .pushSnapshot({ key, payload, updatedAt: now() })
      .catch((err) => onError(key, err))
      .finally(() => {
        if (inflight.get(key) === p) inflight.delete(key);
      });
    inflight.set(key, p);
    return p;
  }

  function schedule(key: string): void {
    const existing = timers.get(key);
    if (existing !== undefined) clearTimeout(existing);
    const handle = setTimeout(() => {
      timers.delete(key);
      void doPush(key);
    }, debounceMs);
    timers.set(key, handle);
  }

  async function flush(): Promise<void> {
    for (const [key, handle] of timers) {
      clearTimeout(handle);
      timers.delete(key);
      void doPush(key);
    }
    while (inflight.size > 0) {
      await Promise.all(inflight.values());
    }
  }

  function dispose(): void {
    for (const handle of timers.values()) clearTimeout(handle);
    timers.clear();
  }

  return { schedule, flush, dispose };
}
