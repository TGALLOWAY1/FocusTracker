import { describe, expect, it } from "vitest";
import { computeStreaks } from "./useStreaks";
import type { CompletedSession, LoggedSession } from "./focusStore";

function makeSession(
  endedAt: number,
  projectId: string = "p1"
): LoggedSession {
  const session: CompletedSession = {
    id: `s-${endedAt}-${projectId}`,
    projectId,
    projectName: projectId,
    task: "Test",
    startedAt: endedAt - 25 * 60 * 1000,
    endedAt,
    plannedDurationSec: 25 * 60,
    actualDurationSec: 25 * 60,
    completedNaturally: true,
    activityCategory: "other",
    sessionType: "deep",
    tags: [],
    taskRecords: [],
  };
  return { session, reflection: null };
}

// Wednesday 2024-11-13 12:00 local (matches useWeeklyStats.test anchor).
const REF_NOW = new Date(2024, 10, 13, 12, 0, 0, 0);

const TODAY = new Date(2024, 10, 13, 9, 0, 0, 0).getTime();
const YESTERDAY = new Date(2024, 10, 12, 9, 0, 0, 0).getTime();
const TWO_DAYS_AGO = new Date(2024, 10, 11, 9, 0, 0, 0).getTime();
const THREE_DAYS_AGO = new Date(2024, 10, 10, 9, 0, 0, 0).getTime();

describe("computeStreaks", () => {
  it("returns 0/0 on empty log", () => {
    expect(computeStreaks([], "p1", REF_NOW)).toEqual({
      focusStreakDays: 0,
      projectStreakDays: 0,
    });
  });

  it("counts three consecutive days ending today as 3", () => {
    const sessions = [
      makeSession(TWO_DAYS_AGO),
      makeSession(YESTERDAY),
      makeSession(TODAY),
    ];
    const result = computeStreaks(sessions, "p1", REF_NOW);
    expect(result.focusStreakDays).toBe(3);
    expect(result.projectStreakDays).toBe(3);
  });

  it("keeps streak alive when most recent session was yesterday (no session today yet)", () => {
    const sessions = [
      makeSession(THREE_DAYS_AGO),
      makeSession(TWO_DAYS_AGO),
      makeSession(YESTERDAY),
    ];
    const result = computeStreaks(sessions, "p1", REF_NOW);
    expect(result.focusStreakDays).toBe(3);
    expect(result.projectStreakDays).toBe(3);
  });

  it("breaks streak when most recent session is older than yesterday", () => {
    const sessions = [
      makeSession(THREE_DAYS_AGO),
      makeSession(TWO_DAYS_AGO),
    ];
    const result = computeStreaks(sessions, "p1", REF_NOW);
    expect(result.focusStreakDays).toBe(0);
    expect(result.projectStreakDays).toBe(0);
  });

  it("collapses multiple sessions on the same local day to one day", () => {
    const sessions = [
      makeSession(new Date(2024, 10, 13, 8, 0, 0, 0).getTime()),
      makeSession(new Date(2024, 10, 13, 14, 0, 0, 0).getTime()),
      makeSession(new Date(2024, 10, 13, 20, 0, 0, 0).getTime()),
    ];
    expect(computeStreaks(sessions, "p1", REF_NOW).focusStreakDays).toBe(1);
  });

  it("does not count a single gap as continuous", () => {
    // Session today + session two days ago — gap on yesterday.
    const sessions = [
      makeSession(TWO_DAYS_AGO),
      makeSession(TODAY),
    ];
    expect(computeStreaks(sessions, "p1", REF_NOW).focusStreakDays).toBe(1);
  });

  it("project streak filters by active projectId", () => {
    // Mon, Tue, Wed sessions. Tuesday is a different project.
    const sessions = [
      makeSession(TWO_DAYS_AGO, "p1"),
      makeSession(YESTERDAY, "p2"),
      makeSession(TODAY, "p1"),
    ];
    const result = computeStreaks(sessions, "p1", REF_NOW);
    expect(result.focusStreakDays).toBe(3); // any-project view sees Mon/Tue/Wed
    expect(result.projectStreakDays).toBe(1); // only Wed counts for p1
  });

  it("returns 0 project streak when active project has no sessions", () => {
    const sessions = [makeSession(TODAY, "p1"), makeSession(YESTERDAY, "p1")];
    const result = computeStreaks(sessions, "different-project", REF_NOW);
    expect(result.focusStreakDays).toBe(2);
    expect(result.projectStreakDays).toBe(0);
  });

  it("buckets by local civil day across the US spring-forward boundary", () => {
    // 2024-03-10 is the US DST spring-forward (clocks jump 02:00 -> 03:00).
    // Constructing dates via `new Date(y, m, d, h)` always means local time,
    // so three consecutive calendar-day timestamps should always resolve to
    // three distinct day-keys regardless of whether the middle day was 23h.
    const dstRefNow = new Date(2024, 2, 12, 12, 0, 0, 0); // Tue Mar 12
    const dstSat = new Date(2024, 2, 9, 12, 0, 0, 0).getTime();
    const dstSun = new Date(2024, 2, 10, 12, 0, 0, 0).getTime();
    const dstMon = new Date(2024, 2, 11, 12, 0, 0, 0).getTime();
    const sessions = [
      makeSession(dstSat),
      makeSession(dstSun),
      makeSession(dstMon),
    ];
    // Most recent (Mar 11 Mon) is "yesterday" relative to Mar 12 Tue.
    expect(computeStreaks(sessions, "p1", dstRefNow).focusStreakDays).toBe(3);
  });
});
