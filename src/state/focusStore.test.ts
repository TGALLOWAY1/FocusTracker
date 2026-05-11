import { describe, expect, it, beforeEach } from "vitest";
import { useFocusStore } from "./focusStore";

const SHORT_DURATION_SEC = 3;

function resetStore() {
  // Force a clean slate so each test starts from the seeded defaults.
  // localStorage doesn't exist under node — Zustand's persist will no-op
  // its storage call, which is fine for these reducer-level checks.
  useFocusStore.setState({
    status: "idle",
    durationSec: SHORT_DURATION_SEC,
    remainingSec: SHORT_DURATION_SEC,
    pendingReflectionFor: null,
    sessionLog: [],
  });
}

describe("focusStore", () => {
  beforeEach(resetStore);

  it("start() puts the store into running with a fresh remaining countdown", () => {
    const { start } = useFocusStore.getState();
    start();
    const state = useFocusStore.getState();
    expect(state.status).toBe("running");
    expect(state.remainingSec).toBe(SHORT_DURATION_SEC);
  });

  it("tick() to completion goes idle, resets the timer, and queues a natural-completion reflection", () => {
    const { start, tick } = useFocusStore.getState();
    start();
    for (let i = 0; i < SHORT_DURATION_SEC; i++) {
      tick();
    }
    const state = useFocusStore.getState();
    expect(state.status).toBe("idle");
    expect(state.remainingSec).toBe(SHORT_DURATION_SEC);
    expect(state.pendingReflectionFor).not.toBeNull();
    expect(state.pendingReflectionFor?.completedNaturally).toBe(true);
    expect(state.pendingReflectionFor?.plannedDurationSec).toBe(
      SHORT_DURATION_SEC
    );
  });
});
