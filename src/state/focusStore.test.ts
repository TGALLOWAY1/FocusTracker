import { describe, expect, it, beforeEach } from "vitest";
import {
  applyXpAward,
  useFocusStore,
  xpForSession,
  type CompletedSession,
} from "./focusStore";

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
    currentTierId: 1,
    xp: 0,
  });
}

function makeSession(
  actualDurationSec: number,
  completedNaturally: boolean
): CompletedSession {
  const endedAt = Date.now();
  return {
    id: "test",
    projectId: "test-project",
    project: "Test",
    task: "Test",
    startedAt: endedAt - actualDurationSec * 1000,
    endedAt,
    plannedDurationSec: actualDurationSec,
    actualDurationSec,
    completedNaturally,
    activityCategory: "other",
    sessionType: "light",
    tags: [],
  };
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

  describe("xpForSession", () => {
    it("awards 0 XP for an early-ended sub-minute session", () => {
      expect(xpForSession(makeSession(30, false))).toBe(0);
    });

    it("awards minutes + bonus for a short natural session", () => {
      // 1 min × 1 + 5 bonus = 6
      expect(xpForSession(makeSession(60, true))).toBe(6);
    });

    it("awards 60 + 5 = 65 for a 60-min natural session (no deep-work yet)", () => {
      expect(xpForSession(makeSession(60 * 60, true))).toBe(65);
    });

    it("awards 60 + 15×3 + 5 = 110 for a 75-min natural session", () => {
      expect(xpForSession(makeSession(75 * 60, true))).toBe(110);
    });

    it("awards 60 + 30×3 = 150 for a 90-min early-ended session (no bonus)", () => {
      expect(xpForSession(makeSession(90 * 60, false))).toBe(150);
    });
  });

  describe("applyXpAward", () => {
    it("does not advance if the award stays below the threshold", () => {
      expect(applyXpAward(1, 100, 50)).toEqual({ currentTierId: 1, xp: 150 });
    });

    it("rolls overflow into the next tier", () => {
      // Tier 1 xpToNext = 250. 248 + 6 = 254 → advance, carry 4.
      expect(applyXpAward(1, 248, 6)).toEqual({ currentTierId: 2, xp: 4 });
    });

    it("walks past multiple tiers in a single award", () => {
      // Tier 1 (250) + Tier 2 (500) = 750. Award 1000 from 0 → tier 3, xp 250.
      expect(applyXpAward(1, 0, 1000)).toEqual({ currentTierId: 3, xp: 250 });
    });

    it("never advances past the peak tier (xpToNext = Infinity)", () => {
      expect(applyXpAward(6, 9999, 50000)).toEqual({
        currentTierId: 6,
        xp: 59999,
      });
    });
  });

  describe("submitReflection / dismissReflection award XP and advance tiers", () => {
    function queueNaturalCompletion(actualSec: number) {
      // Drive a real natural completion through tick() so pendingReflectionFor
      // matches what production code produces.
      useFocusStore.setState({
        durationSec: actualSec,
        remainingSec: actualSec,
        status: "running",
        pendingReflectionFor: null,
      });
      const { tick } = useFocusStore.getState();
      for (let i = 0; i < actualSec; i++) tick();
    }

    it("submitReflection awards xpForSession(pending) and rolls into the next tier", () => {
      useFocusStore.setState({ currentTierId: 1, xp: 248 });
      queueNaturalCompletion(60);
      const { submitReflection } = useFocusStore.getState();
      submitReflection({
        sessionId: "test",
        focusLevel: 4,
        energyLevel: 4,
        completedPlanned: true,
        createdAt: Date.now(),
      });
      const state = useFocusStore.getState();
      // 1 min × 1 + 5 bonus = 6. 248 + 6 = 254 → tier 2, xp 4.
      expect(state.currentTierId).toBe(2);
      expect(state.xp).toBe(4);
      expect(state.sessionLog).toHaveLength(1);
      expect(state.sessionLog[0].reflection).not.toBeNull();
    });

    it("dismissReflection still awards XP", () => {
      useFocusStore.setState({ currentTierId: 1, xp: 0 });
      queueNaturalCompletion(60);
      const { dismissReflection } = useFocusStore.getState();
      dismissReflection();
      const state = useFocusStore.getState();
      expect(state.xp).toBe(6);
      expect(state.sessionLog[0].reflection).toBeNull();
    });
  });
});
