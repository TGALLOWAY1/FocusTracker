import { describe, expect, it, beforeEach } from "vitest";
import {
  applyXpAward,
  useFocusStore,
  xpForSession,
  type CompletedSession,
} from "./focusStore";
import { useProjectStore } from "./projectStore";
import type { Project } from "../data/projects";

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
    projectName: "Test",
    task: "Test",
    startedAt: endedAt - actualDurationSec * 1000,
    endedAt,
    plannedDurationSec: actualDurationSec,
    actualDurationSec,
    completedNaturally,
    activityCategory: "other",
    sessionType: "light",
    tags: [],
    taskRecords: [],
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

  it("tick() to completion commits the session to sessionLog with reflection: null", () => {
    const { start, tick } = useFocusStore.getState();
    start();
    for (let i = 0; i < SHORT_DURATION_SEC; i++) {
      tick();
    }
    const state = useFocusStore.getState();
    expect(state.sessionLog).toHaveLength(1);
    expect(state.sessionLog[0].reflection).toBeNull();
    expect(state.sessionLog[0].session.id).toBe(state.pendingReflectionFor?.id);
  });

  it("end() before timer completion also commits the session immediately", () => {
    const { start, tick, end } = useFocusStore.getState();
    start();
    tick(); // burn 1 second
    end();
    const state = useFocusStore.getState();
    expect(state.sessionLog).toHaveLength(1);
    expect(state.sessionLog[0].reflection).toBeNull();
    expect(state.sessionLog[0].session.completedNaturally).toBe(false);
  });

  describe("projectName is a live snapshot from projectStore at completion time", () => {
    function seedProject(id: string, name: string) {
      const baseline: Project = {
        id,
        name,
        description: "",
        category: "",
        status: "active",
        tags: [],
        weeklyMinutes: 0,
        weeklyGoalMinutes: 600,
        progressPercent: 0,
        color: "purple",
        iconKey: "code",
        activityCategory: "other",
        cover: { kind: "preset", preset: "nebula" },
        manualEntries: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      useProjectStore.setState({ projects: [baseline] });
    }

    it("snapshots the CURRENT projectStore name onto the completed session", () => {
      seedProject("proj-x", "Original Name");
      useFocusStore.setState({
        projectId: "proj-x",
        durationSec: 1,
        remainingSec: 1,
        status: "running",
        sessionLog: [],
        pendingReflectionFor: null,
      });
      useFocusStore.getState().tick();
      const session = useFocusStore.getState().sessionLog[0].session;
      expect(session.projectName).toBe("Original Name");
      expect(session.projectId).toBe("proj-x");
    });

    it("a later rename does not retroactively change the snapshot", () => {
      seedProject("proj-y", "Old Name");
      useFocusStore.setState({
        projectId: "proj-y",
        durationSec: 1,
        remainingSec: 1,
        status: "running",
        sessionLog: [],
        pendingReflectionFor: null,
      });
      useFocusStore.getState().tick();
      // Rename the project after the session is logged.
      seedProject("proj-y", "New Name");
      const session = useFocusStore.getState().sessionLog[0].session;
      // The historical log keeps the old label — that's the whole point.
      expect(session.projectName).toBe("Old Name");
    });

    it("falls back to 'Unknown Project' when projectId resolves to nothing", () => {
      useProjectStore.setState({ projects: [] });
      useFocusStore.setState({
        projectId: "does-not-exist",
        durationSec: 1,
        remainingSec: 1,
        status: "running",
        sessionLog: [],
        pendingReflectionFor: null,
      });
      useFocusStore.getState().tick();
      const session = useFocusStore.getState().sessionLog[0].session;
      expect(session.projectName).toBe("Unknown Project");
    });
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

  describe("session lifecycle: XP awarded at completion, reflection attached after", () => {
    function queueNaturalCompletion(actualSec: number) {
      // Drive a real natural completion through tick() so the lifecycle
      // matches what production code produces.
      useFocusStore.setState({
        durationSec: actualSec,
        remainingSec: actualSec,
        status: "running",
        pendingReflectionFor: null,
        sessionLog: [],
      });
      const { tick } = useFocusStore.getState();
      for (let i = 0; i < actualSec; i++) tick();
    }

    it("tick() to completion awards xpForSession and rolls into the next tier", () => {
      useFocusStore.setState({ currentTierId: 1, xp: 248 });
      queueNaturalCompletion(60);
      const state = useFocusStore.getState();
      // 1 min × 1 + 5 bonus = 6. 248 + 6 = 254 → tier 2, xp 4.
      expect(state.currentTierId).toBe(2);
      expect(state.xp).toBe(4);
      expect(state.sessionLog).toHaveLength(1);
    });

    it("submitReflection updates the existing log entry in place (no duplicate)", () => {
      useFocusStore.setState({ currentTierId: 1, xp: 0 });
      queueNaturalCompletion(60);
      const sessionId = useFocusStore.getState().pendingReflectionFor!.id;
      const { submitReflection } = useFocusStore.getState();
      submitReflection({
        sessionId,
        focusLevel: 4,
        energyLevel: 3,
        completedPlanned: true,
        createdAt: Date.now(),
      });
      const state = useFocusStore.getState();
      expect(state.sessionLog).toHaveLength(1);
      expect(state.sessionLog[0].reflection).not.toBeNull();
      expect(state.sessionLog[0].reflection?.focusLevel).toBe(4);
      expect(state.pendingReflectionFor).toBeNull();
    });

    it("submitReflection does not re-award XP (already awarded at completion)", () => {
      useFocusStore.setState({ currentTierId: 1, xp: 0 });
      queueNaturalCompletion(60);
      const xpAfterCompletion = useFocusStore.getState().xp;
      const sessionId = useFocusStore.getState().pendingReflectionFor!.id;
      const { submitReflection } = useFocusStore.getState();
      submitReflection({
        sessionId,
        focusLevel: 5,
        energyLevel: 5,
        completedPlanned: true,
        createdAt: Date.now(),
      });
      expect(useFocusStore.getState().xp).toBe(xpAfterCompletion);
    });

    it("dismissReflection clears the modal pointer but leaves the log entry intact", () => {
      useFocusStore.setState({ currentTierId: 1, xp: 0 });
      queueNaturalCompletion(60);
      const { dismissReflection } = useFocusStore.getState();
      dismissReflection();
      const state = useFocusStore.getState();
      expect(state.pendingReflectionFor).toBeNull();
      expect(state.sessionLog).toHaveLength(1);
      expect(state.sessionLog[0].reflection).toBeNull();
      // XP was awarded at completion, not at dismiss — same 6 as the
      // natural-completion path above.
      expect(state.xp).toBe(6);
    });

    it("a refresh after completion preserves the session in sessionLog", () => {
      // Simulates the persist/rehydrate path: sessionLog is persisted but
      // pendingReflectionFor is not. The session must remain in the log
      // so it's recoverable in Insights, even if the modal is gone.
      useFocusStore.setState({ currentTierId: 1, xp: 0 });
      queueNaturalCompletion(60);
      const beforeRefresh = useFocusStore.getState().sessionLog;
      // Simulate rehydrate: pendingReflectionFor gets cleared by `merge`.
      useFocusStore.setState({ pendingReflectionFor: null });
      const state = useFocusStore.getState();
      expect(state.sessionLog).toEqual(beforeRefresh);
      expect(state.sessionLog).toHaveLength(1);
      expect(state.sessionLog[0].reflection).toBeNull();
    });
  });

  describe("task timing", () => {
    it("start() records a wall-clock startedAt", () => {
      useFocusStore.setState({ startedAt: null });
      useFocusStore.getState().start();
      expect(typeof useFocusStore.getState().startedAt).toBe("number");
    });

    it("toggleTodo timestamps a todo on check and clears it on uncheck", () => {
      useFocusStore.setState({
        todos: [{ id: "t1", text: "Task 1", done: false, completedAt: null }],
      });
      useFocusStore.getState().toggleTodo("t1");
      let todo = useFocusStore.getState().todos[0];
      expect(todo.done).toBe(true);
      expect(typeof todo.completedAt).toBe("number");

      useFocusStore.getState().toggleTodo("t1");
      todo = useFocusStore.getState().todos[0];
      expect(todo.done).toBe(false);
      expect(todo.completedAt).toBeNull();
    });

    it("end() snapshots todos into taskRecords with gap-based durations", () => {
      const start = 1_000_000;
      useFocusStore.setState({
        status: "running",
        startedAt: start,
        durationSec: 600,
        remainingSec: 0,
        sessionLog: [],
        pendingReflectionFor: null,
        todos: [
          { id: "a", text: "A", done: true, completedAt: start + 60_000 },
          { id: "b", text: "B", done: true, completedAt: start + 200_000 },
          { id: "c", text: "C", done: false, completedAt: null },
        ],
      });
      useFocusStore.getState().end();
      const records =
        useFocusStore.getState().sessionLog[0].session.taskRecords;
      expect(records).toHaveLength(3);
      expect(records[0]).toMatchObject({ id: "a", durationSec: 60, tag: null });
      // b: 200s after start − 60s spent on a = 140s gap.
      expect(records[1]).toMatchObject({ id: "b", durationSec: 140 });
      expect(records[2]).toMatchObject({
        id: "c",
        durationSec: null,
        completedAt: null,
      });
    });

    it("derives task durations by checkoff order, not list order", () => {
      const start = 2_000_000;
      useFocusStore.setState({
        status: "running",
        startedAt: start,
        durationSec: 600,
        remainingSec: 0,
        sessionLog: [],
        pendingReflectionFor: null,
        todos: [
          { id: "a", text: "A", done: true, completedAt: start + 300_000 },
          { id: "b", text: "B", done: true, completedAt: start + 100_000 },
        ],
      });
      useFocusStore.getState().end();
      const records =
        useFocusStore.getState().sessionLog[0].session.taskRecords;
      const a = records.find((r) => r.id === "a")!;
      const b = records.find((r) => r.id === "b")!;
      // b checked first: 100s from start. a checked second: 200s gap from b.
      expect(b.durationSec).toBe(100);
      expect(a.durationSec).toBe(200);
    });

    it("updateTaskRecord patches duration and tag on a logged session", () => {
      useFocusStore.setState({
        status: "running",
        startedAt: 3_000_000,
        durationSec: 600,
        remainingSec: 0,
        sessionLog: [],
        pendingReflectionFor: null,
        todos: [{ id: "x", text: "X", done: false, completedAt: null }],
      });
      useFocusStore.getState().end();
      const sessionId = useFocusStore.getState().sessionLog[0].session.id;

      useFocusStore
        .getState()
        .updateTaskRecord(sessionId, "x", { durationSec: 1800, tag: "Mixing" });
      const record =
        useFocusStore.getState().sessionLog[0].session.taskRecords[0];
      expect(record.durationSec).toBe(1800);
      expect(record.tag).toBe("Mixing");
    });
  });
});
