import { describe, expect, it } from "vitest";
import { computeInsights } from "./useInsightsData";
import type {
  CompletedSession,
  LoggedSession,
  SessionReflection,
} from "./focusStore";
import type { ActivityCategory } from "../data/activityCategories";

type MakeSessionInput = {
  endedAt: number;
  durationMin: number;
  completedNaturally?: boolean;
  category?: ActivityCategory;
  sessionType?: "deep" | "light" | "learning";
  projectId?: string;
  focusLevel?: number;
};

function makeSession(input: MakeSessionInput): LoggedSession {
  const actualDurationSec = input.durationMin * 60;
  const session: CompletedSession = {
    id: `s-${input.endedAt}`,
    projectId: input.projectId ?? "p1",
    project: "Test",
    task: "Test",
    startedAt: input.endedAt - actualDurationSec * 1000,
    endedAt: input.endedAt,
    plannedDurationSec: actualDurationSec,
    actualDurationSec,
    completedNaturally: input.completedNaturally ?? true,
    activityCategory: input.category ?? "coding",
    sessionType: input.sessionType ?? "light",
    tags: [],
  };
  const reflection: SessionReflection | null =
    input.focusLevel === undefined
      ? null
      : {
          sessionId: session.id,
          focusLevel: input.focusLevel,
          energyLevel: 3,
          completedPlanned: true,
          createdAt: input.endedAt,
        };
  return { session, reflection };
}

// Wednesday 2024-11-13 12:00 local — same anchor as useWeeklyStats.test
const REF_NOW = new Date(2024, 10, 13, 12, 0, 0, 0);
const MON = new Date(2024, 10, 11, 9, 0, 0, 0).getTime();
const WED = new Date(2024, 10, 13, 9, 0, 0, 0).getTime();
const PREV_SUN = new Date(2024, 10, 10, 23, 0, 0, 0).getTime();
const FORTY_DAYS_AGO = REF_NOW.getTime() - 40 * 24 * 60 * 60 * 1000;

describe("computeInsights", () => {
  it("returns an honest empty result for an empty log", () => {
    const data = computeInsights(
      [],
      { dateRange: "week", quickFilter: "all" },
      REF_NOW
    );
    expect(data.logEmpty).toBe(true);
    expect(data.sessions).toEqual([]);
    expect(data.summary).toEqual({
      totalMinutes: 0,
      sessionCount: 0,
      completionRate: 0,
      avgFocusRating: 0,
    });
    expect(data.byCategory).toEqual([]);
    expect(data.trend.points).toHaveLength(7);
    expect(data.trend.series).toEqual([]);
    expect(data.trend.maxHours).toBe(1);
  });

  it("excludes sessions outside the week range", () => {
    const sessions = [
      makeSession({ endedAt: WED, durationMin: 60, category: "coding" }),
      makeSession({ endedAt: PREV_SUN, durationMin: 60, category: "coding" }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "all" },
      REF_NOW
    );
    expect(data.sessions).toHaveLength(1);
    expect(data.summary.sessionCount).toBe(1);
    expect(data.summary.totalMinutes).toBe(60);
  });

  it("respects the all-time range", () => {
    const sessions = [
      makeSession({ endedAt: WED, durationMin: 60 }),
      makeSession({ endedAt: FORTY_DAYS_AGO, durationMin: 30 }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "all", quickFilter: "all" },
      REF_NOW
    );
    expect(data.summary.sessionCount).toBe(2);
    expect(data.summary.totalMinutes).toBe(90);
  });

  it("computes byCategory percents and sorts descending", () => {
    const sessions = [
      makeSession({ endedAt: WED, durationMin: 60, category: "coding" }),
      makeSession({ endedAt: MON, durationMin: 30, category: "learning" }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "all" },
      REF_NOW
    );
    expect(data.byCategory).toHaveLength(2);
    expect(data.byCategory[0].category).toBe("coding");
    expect(data.byCategory[0].minutes).toBe(60);
    expect(data.byCategory[0].percent).toBeCloseTo(60 / 90, 5);
    expect(data.byCategory[1].category).toBe("learning");
    expect(data.byCategory[1].percent).toBeCloseTo(30 / 90, 5);
  });

  it("filters by quickFilter=deep", () => {
    const sessions = [
      makeSession({
        endedAt: WED,
        durationMin: 90,
        sessionType: "deep",
        category: "coding",
      }),
      makeSession({
        endedAt: MON,
        durationMin: 25,
        sessionType: "light",
        category: "coding",
      }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "deep" },
      REF_NOW
    );
    expect(data.sessions).toHaveLength(1);
    expect(data.summary.totalMinutes).toBe(90);
  });

  it("filters by quickFilter=endedEarly", () => {
    const sessions = [
      makeSession({
        endedAt: WED,
        durationMin: 30,
        completedNaturally: false,
      }),
      makeSession({
        endedAt: MON,
        durationMin: 30,
        completedNaturally: true,
      }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "endedEarly" },
      REF_NOW
    );
    expect(data.sessions).toHaveLength(1);
    expect(data.summary.completionRate).toBe(0);
  });

  it("filters by projectId", () => {
    const sessions = [
      makeSession({ endedAt: WED, durationMin: 60, projectId: "a" }),
      makeSession({ endedAt: MON, durationMin: 60, projectId: "b" }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "all", projectId: "a" },
      REF_NOW
    );
    expect(data.sessions).toHaveLength(1);
    expect(data.sessions[0].session.projectId).toBe("a");
  });

  it("averages focus rating only across sessions with reflections", () => {
    const sessions = [
      makeSession({ endedAt: WED, durationMin: 60, focusLevel: 4 }),
      makeSession({ endedAt: MON, durationMin: 60, focusLevel: 2 }),
      makeSession({ endedAt: MON, durationMin: 60 }), // no reflection
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "all" },
      REF_NOW
    );
    expect(data.summary.avgFocusRating).toBeCloseTo(3, 5);
  });

  it("places sessions into the correct day bucket in the weekly trend", () => {
    const sessions = [
      makeSession({ endedAt: WED, durationMin: 60, category: "coding" }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "all" },
      REF_NOW
    );
    expect(data.trend.points.map((p) => p.label)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
    const coding = data.trend.series.find((s) => s.category === "coding");
    expect(coding).toBeDefined();
    // Wed is index 2
    expect(coding!.values[2]).toBeCloseTo(1, 5);
    expect(coding!.values[0]).toBe(0);
  });

  it("sorts the feed by endedAt descending", () => {
    const sessions = [
      makeSession({ endedAt: MON, durationMin: 30 }),
      makeSession({ endedAt: WED, durationMin: 30 }),
    ];
    const data = computeInsights(
      sessions,
      { dateRange: "week", quickFilter: "all" },
      REF_NOW
    );
    expect(data.sessions.map((s) => s.session.endedAt)).toEqual([WED, MON]);
  });
});
