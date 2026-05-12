import { describe, expect, it } from "vitest";
import { computeProjectStats } from "./useProjectStats";
import type {
  CompletedSession,
  LoggedSession,
  SessionReflection,
} from "./focusStore";
import type { ManualEntry } from "../data/projects";

function makeSession(
  projectId: string,
  endedAt: number,
  durationMin: number
): LoggedSession {
  const actualDurationSec = durationMin * 60;
  const session: CompletedSession = {
    id: `s-${endedAt}`,
    projectId,
    projectName: "Test",
    task: "Test",
    startedAt: endedAt - actualDurationSec * 1000,
    endedAt,
    plannedDurationSec: actualDurationSec,
    actualDurationSec,
    completedNaturally: true,
    activityCategory: "coding",
    sessionType: "light",
    tags: [],
  };
  const reflection: SessionReflection | null = null;
  return { session, reflection };
}

// Wednesday 2024-11-13 12:00 local
const REF_NOW = new Date(2024, 10, 13, 12, 0, 0, 0);
const MONDAY = new Date(2024, 10, 11, 0, 0, 0, 0).getTime();
const DAY = 24 * 60 * 60 * 1000;

describe("computeProjectStats", () => {
  it("returns zeros when no sessions or manual entries match", () => {
    const log = [makeSession("other", REF_NOW.getTime(), 30)];
    const stats = computeProjectStats("p1", log, [], REF_NOW);
    expect(stats).toEqual({
      totalMinutes: 0,
      weekMinutes: 0,
      monthMinutes: 0,
      sessionCount: 0,
      lastActivityAt: null,
    });
  });

  it("sums session minutes filtered by projectId", () => {
    const log: LoggedSession[] = [
      makeSession("p1", MONDAY + 1 * DAY, 25),
      makeSession("p1", MONDAY + 2 * DAY, 35),
      makeSession("p2", MONDAY + 2 * DAY, 100),
    ];
    const stats = computeProjectStats("p1", log, [], REF_NOW);
    expect(stats.totalMinutes).toBe(60);
    expect(stats.weekMinutes).toBe(60);
    expect(stats.sessionCount).toBe(2);
    expect(stats.lastActivityAt).toBe(MONDAY + 2 * DAY);
  });

  it("excludes sessions older than the current week from weekMinutes", () => {
    const log: LoggedSession[] = [
      makeSession("p1", MONDAY - 7 * DAY, 60),
      makeSession("p1", MONDAY + 1 * DAY, 30),
    ];
    const stats = computeProjectStats("p1", log, [], REF_NOW);
    expect(stats.totalMinutes).toBe(90);
    expect(stats.weekMinutes).toBe(30);
  });

  it("includes manual entries in totals and last activity", () => {
    const sessionEnd = MONDAY + 1 * DAY;
    const manualAddedAt = MONDAY + 3 * DAY;
    const log: LoggedSession[] = [makeSession("p1", sessionEnd, 20)];
    const manual: ManualEntry[] = [
      { id: "m1", minutes: 45, addedAt: manualAddedAt },
    ];
    const stats = computeProjectStats("p1", log, manual, REF_NOW);
    expect(stats.totalMinutes).toBe(65);
    expect(stats.weekMinutes).toBe(65);
    expect(stats.lastActivityAt).toBe(manualAddedAt);
  });

  it("counts month minutes within the rolling 30-day window", () => {
    const now = REF_NOW.getTime();
    const log: LoggedSession[] = [
      makeSession("p1", now - 5 * DAY, 10),
      makeSession("p1", now - 60 * DAY, 200),
    ];
    const stats = computeProjectStats("p1", log, [], REF_NOW);
    expect(stats.totalMinutes).toBe(210);
    expect(stats.monthMinutes).toBe(10);
  });
});
