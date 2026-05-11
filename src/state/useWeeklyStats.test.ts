import { describe, expect, it } from "vitest";
import { bucketWeeklyStats } from "./useWeeklyStats";
import type { CompletedSession, LoggedSession } from "./focusStore";

function makeSession(
  endedAt: number,
  actualDurationSec: number,
  completedNaturally: boolean
): LoggedSession {
  const session: CompletedSession = {
    id: `s-${endedAt}`,
    project: "Test",
    task: "Test",
    plannedDurationSec: actualDurationSec,
    actualDurationSec,
    endedAt,
    completedNaturally,
  };
  return { session, reflection: null };
}

// Wednesday, 2024-11-13 12:00 local — pick a known-Wed for stability.
const REF_NOW = new Date(2024, 10, 13, 12, 0, 0, 0);
const MON = new Date(2024, 10, 11, 9, 0, 0, 0).getTime();
const WED = new Date(2024, 10, 13, 9, 0, 0, 0).getTime();
const FRI = new Date(2024, 10, 15, 9, 0, 0, 0).getTime();
const PREV_SUN = new Date(2024, 10, 10, 23, 0, 0, 0).getTime();

describe("bucketWeeklyStats", () => {
  it("returns an honest zero-state on an empty log", () => {
    const stats = bucketWeeklyStats([], REF_NOW);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.sessionCount).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.daily.map((d) => d.day)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
    expect(stats.daily.every((d) => d.hours === 0)).toBe(true);
    expect(stats.maxYHours).toBe(2);
  });

  it("buckets sessions into the correct weekday slot in local TZ", () => {
    const sessions = [
      makeSession(MON, 30 * 60, true),
      makeSession(WED, 60 * 60, true),
      makeSession(FRI, 45 * 60, false),
    ];
    const stats = bucketWeeklyStats(sessions, REF_NOW);
    expect(stats.sessionCount).toBe(3);
    expect(stats.totalMinutes).toBe(30 + 60 + 45);
    // 2 of 3 completed naturally.
    expect(stats.completionRate).toBeCloseTo(2 / 3, 5);
    expect(stats.daily[0].hours).toBeCloseTo(0.5, 5); // Mon
    expect(stats.daily[2].hours).toBeCloseTo(1, 5); // Wed
    expect(stats.daily[4].hours).toBeCloseTo(0.75, 5); // Fri
    // maxYHours = max(2, ceil(1)) = 2 for these durations.
    expect(stats.maxYHours).toBe(2);
  });

  it("excludes sessions from prior weeks", () => {
    const stats = bucketWeeklyStats(
      [makeSession(PREV_SUN, 30 * 60, true)],
      REF_NOW
    );
    expect(stats.sessionCount).toBe(0);
    expect(stats.totalMinutes).toBe(0);
  });

  it("grows maxYHours when peak day exceeds 2 hours", () => {
    const stats = bucketWeeklyStats(
      [makeSession(WED, 4.5 * 60 * 60, true)],
      REF_NOW
    );
    expect(stats.maxYHours).toBe(5); // ceil(4.5)
  });
});
