import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPushScheduler,
  hydrateMissingSnapshots,
  type Snapshot,
  type SnapshotBackend,
} from "./snapshotSync";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    key: (i) => Array.from(data.keys())[i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
}

function fakeBackend(initialRemote: Snapshot[] = []) {
  const remote = new Map(initialRemote.map((s) => [s.key, s]));
  const pushes: Snapshot[] = [];
  const backend: SnapshotBackend = {
    fetchSnapshots: vi.fn(async (keys: string[]) =>
      keys
        .map((k) => remote.get(k))
        .filter((s): s is Snapshot => s !== undefined)
    ),
    pushSnapshot: vi.fn(async (s: Snapshot) => {
      pushes.push(s);
      remote.set(s.key, s);
    }),
  };
  return { backend, remote, pushes };
}

describe("hydrateMissingSnapshots", () => {
  it("fills only the keys that are absent locally", async () => {
    const storage = memoryStorage({
      "focus-ladder.focus": '{"state":{"xp":42},"version":4}',
    });
    const { backend } = fakeBackend([
      { key: "focus-ladder.focus", payload: "REMOTE-FOCUS", updatedAt: 1 },
      { key: "focus-ladder.projects", payload: "REMOTE-PROJ", updatedAt: 2 },
    ]);

    const hydrated = await hydrateMissingSnapshots(
      backend,
      ["focus-ladder.focus", "focus-ladder.projects", "focus-ladder.ideas"],
      storage
    );

    expect(hydrated).toEqual(["focus-ladder.projects"]);
    expect(storage.getItem("focus-ladder.focus")).toBe(
      '{"state":{"xp":42},"version":4}'
    );
    expect(storage.getItem("focus-ladder.projects")).toBe("REMOTE-PROJ");
    expect(storage.getItem("focus-ladder.ideas")).toBeNull();
    expect(backend.fetchSnapshots).toHaveBeenCalledWith([
      "focus-ladder.projects",
      "focus-ladder.ideas",
    ]);
  });

  it("skips the network call entirely when nothing is missing", async () => {
    const storage = memoryStorage({
      "focus-ladder.focus": "LOCAL",
      "focus-ladder.projects": "LOCAL",
    });
    const { backend } = fakeBackend([
      { key: "focus-ladder.focus", payload: "REMOTE", updatedAt: 1 },
    ]);

    const hydrated = await hydrateMissingSnapshots(
      backend,
      ["focus-ladder.focus", "focus-ladder.projects"],
      storage
    );

    expect(hydrated).toEqual([]);
    expect(backend.fetchSnapshots).not.toHaveBeenCalled();
  });
});

describe("createPushScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces rapid schedules and pushes the latest payload once", async () => {
    const storage = memoryStorage({ k1: "v1" });
    const { backend, pushes } = fakeBackend();
    const scheduler = createPushScheduler(backend, {
      storage,
      debounceMs: 100,
      now: () => 1000,
    });

    scheduler.schedule("k1");
    storage.setItem("k1", "v2");
    scheduler.schedule("k1");
    storage.setItem("k1", "v3");
    scheduler.schedule("k1");

    expect(backend.pushSnapshot).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    await scheduler.flush();

    expect(pushes).toEqual([
      { key: "k1", payload: "v3", updatedAt: 1000 },
    ]);
  });

  it("dedupes pushes when the payload hasn't changed since the last push", async () => {
    const storage = memoryStorage({ k1: "same" });
    const { backend } = fakeBackend();
    const scheduler = createPushScheduler(backend, {
      storage,
      debounceMs: 10,
    });

    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    expect(backend.pushSnapshot).toHaveBeenCalledTimes(1);
  });

  it("pushes again once the payload changes after a same-payload skip", async () => {
    const storage = memoryStorage({ k1: "a" });
    const { backend, pushes } = fakeBackend();
    const scheduler = createPushScheduler(backend, {
      storage,
      debounceMs: 10,
    });

    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    storage.setItem("k1", "b");
    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    expect(pushes.map((p) => p.payload)).toEqual(["a", "b"]);
  });

  it("isolates debounce timers per key", async () => {
    const storage = memoryStorage({ k1: "v1", k2: "v2" });
    const { backend, pushes } = fakeBackend();
    const scheduler = createPushScheduler(backend, {
      storage,
      debounceMs: 100,
    });

    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(60);
    scheduler.schedule("k2");
    await vi.advanceTimersByTimeAsync(50);
    await scheduler.flush();

    expect(pushes.map((p) => p.key).sort()).toEqual(["k1", "k2"]);
  });

  it("skips pushing a key whose storage entry is null", async () => {
    const storage = memoryStorage();
    const { backend } = fakeBackend();
    const scheduler = createPushScheduler(backend, {
      storage,
      debounceMs: 10,
    });

    scheduler.schedule("missing");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    expect(backend.pushSnapshot).not.toHaveBeenCalled();
  });

  it("routes push errors to the onError hook without throwing", async () => {
    const storage = memoryStorage({ k1: "v1" });
    const failingBackend: SnapshotBackend = {
      fetchSnapshots: async () => [],
      pushSnapshot: vi.fn(async () => {
        throw new Error("boom");
      }),
    };
    const onError = vi.fn();
    const scheduler = createPushScheduler(failingBackend, {
      storage,
      debounceMs: 10,
      onError,
    });

    scheduler.schedule("k1");
    await vi.advanceTimersByTimeAsync(10);
    await scheduler.flush();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe("k1");
    expect((onError.mock.calls[0][1] as Error).message).toBe("boom");
  });

  it("dispose cancels pending timers so no push fires", async () => {
    const storage = memoryStorage({ k1: "v1" });
    const { backend } = fakeBackend();
    const scheduler = createPushScheduler(backend, {
      storage,
      debounceMs: 100,
    });

    scheduler.schedule("k1");
    scheduler.dispose();
    await vi.advanceTimersByTimeAsync(200);

    expect(backend.pushSnapshot).not.toHaveBeenCalled();
  });
});
