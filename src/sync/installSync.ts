import { useFocusStore } from "../state/focusStore";
import { useIdeaStore } from "../state/ideaStore";
import { useLearningStore } from "../state/learningStore";
import { useProjectStore } from "../state/projectStore";
import { createConvexBackend, tryCreateConvexClient } from "./convexBackend";
import {
  STORE_KEYS,
  createPushScheduler,
  hydrateMissingSnapshots,
  type PushScheduler,
  type SnapshotBackend,
} from "./snapshotSync";

let installed = false;
let activeScheduler: PushScheduler | null = null;

function getBackend(): SnapshotBackend | null {
  const client = tryCreateConvexClient();
  if (client === null) return null;
  return createConvexBackend(client);
}

// Runs before stores are imported (and therefore before Zustand hydrates).
// Fills any localStorage keys that are absent — first-time installs, cache
// clears, fresh devices. Never overwrites existing local state; that's the
// "localStorage primary" contract.
export async function hydrateFromBackend(): Promise<void> {
  if (typeof window === "undefined") return;
  const backend = getBackend();
  if (backend === null) return;
  try {
    const hydrated = await hydrateMissingSnapshots(
      backend,
      STORE_KEYS,
      window.localStorage
    );
    if (hydrated.length > 0) {
      console.info(
        `[snapshotSync] hydrated ${hydrated.length} store(s) from backend`,
        hydrated
      );
    }
  } catch (err) {
    console.error("[snapshotSync] hydrate failed", err);
  }
}

// Subscribes each persisted store to the debounced push scheduler. Idempotent.
// Returns the scheduler (so tests can flush it) or null if Convex is unconfigured.
export function installSync(): PushScheduler | null {
  if (installed) return activeScheduler;
  if (typeof window === "undefined") return null;
  const backend = getBackend();
  if (backend === null) return null;

  const scheduler = createPushScheduler(backend);
  useFocusStore.subscribe(() => scheduler.schedule("focus-ladder.focus"));
  useProjectStore.subscribe(() => scheduler.schedule("focus-ladder.projects"));
  useLearningStore.subscribe(() => scheduler.schedule("focus-ladder.learning"));
  useIdeaStore.subscribe(() => scheduler.schedule("focus-ladder.ideas"));

  // Final flush on unload so an in-flight debounce doesn't lose the
  // user's last edit. `beforeunload` is fired synchronously; we kick off
  // the push but can't await it — the request is best-effort, and the
  // browser will usually allow short pending fetches to complete.
  window.addEventListener("beforeunload", () => {
    void scheduler.flush();
  });

  installed = true;
  activeScheduler = scheduler;
  return scheduler;
}
