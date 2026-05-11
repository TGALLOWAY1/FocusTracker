import { useMemo } from "react";
import { useFocusStore, type LoggedSession } from "./focusStore";
import {
  ACTIVITY_CATEGORIES,
  CATEGORY_ORDER,
  type ActivityCategory,
} from "../data/activityCategories";

export type DateRange = "week" | "month" | "all";
export type QuickFilter =
  | "all"
  | "completed"
  | "endedEarly"
  | "deep"
  | "light";

export type InsightsFilters = {
  dateRange: DateRange;
  quickFilter: QuickFilter;
  projectId?: string | null;
};

export type CategorySlice = {
  category: ActivityCategory;
  minutes: number;
  percent: number;
};

export type CategoryTrendPoint = {
  /** "Mon", "Tue", … for week range; "M 12", "M 13", … for month range. */
  label: string;
  timestamp: number;
};

export type CategoryTrend = {
  points: CategoryTrendPoint[];
  series: Array<{
    category: ActivityCategory;
    /** Hours per point, aligned to `points` indices. */
    values: number[];
  }>;
  /** Y-axis ceiling in hours, ≥ 1. */
  maxHours: number;
};

export type InsightsSummary = {
  totalMinutes: number;
  sessionCount: number;
  /** 0..1, share of filtered sessions that completed naturally. */
  completionRate: number;
  /** 0..5, average focus rating across sessions with reflections; 0 when none. */
  avgFocusRating: number;
};

export type InsightsData = {
  summary: InsightsSummary;
  sessions: LoggedSession[];
  byCategory: CategorySlice[];
  trend: CategoryTrend;
  /** True when the underlying log is empty (regardless of filters). */
  logEmpty: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(now: Date): number {
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - mondayIndex(now),
    0,
    0,
    0,
    0
  );
  return monday.getTime();
}

function rangeBounds(
  range: DateRange,
  now: Date
): { from: number; to: number } | null {
  if (range === "all") return null;
  const todayStart = startOfDay(now.getTime());
  if (range === "week") {
    const from = startOfWeek(now);
    return { from, to: todayStart + DAY_MS };
  }
  // month: last 30 days inclusive
  return { from: todayStart - 29 * DAY_MS, to: todayStart + DAY_MS };
}

function matchesQuickFilter(
  entry: LoggedSession,
  filter: QuickFilter
): boolean {
  const s = entry.session;
  switch (filter) {
    case "all":
      return true;
    case "completed":
      return s.completedNaturally;
    case "endedEarly":
      return !s.completedNaturally;
    case "deep":
      return s.sessionType === "deep";
    case "light":
      return s.sessionType === "light";
  }
}

function applyFilters(
  sessions: LoggedSession[],
  filters: InsightsFilters,
  bounds: { from: number; to: number } | null
): LoggedSession[] {
  return sessions.filter((entry) => {
    if (bounds && (entry.session.endedAt < bounds.from || entry.session.endedAt >= bounds.to)) {
      return false;
    }
    if (filters.projectId && entry.session.projectId !== filters.projectId) {
      return false;
    }
    if (!matchesQuickFilter(entry, filters.quickFilter)) return false;
    return true;
  });
}

function computeByCategory(sessions: LoggedSession[]): CategorySlice[] {
  const minutesByCategory = new Map<ActivityCategory, number>();
  let totalMinutes = 0;
  for (const { session } of sessions) {
    const mins = session.actualDurationSec / 60;
    minutesByCategory.set(
      session.activityCategory,
      (minutesByCategory.get(session.activityCategory) ?? 0) + mins
    );
    totalMinutes += mins;
  }
  const slices: CategorySlice[] = CATEGORY_ORDER.flatMap((category) => {
    const minutes = minutesByCategory.get(category) ?? 0;
    if (minutes === 0) return [];
    return [
      {
        category,
        minutes: Math.round(minutes),
        percent: totalMinutes === 0 ? 0 : minutes / totalMinutes,
      },
    ];
  });
  slices.sort((a, b) => b.minutes - a.minutes);
  return slices;
}

function computeTrend(
  sessions: LoggedSession[],
  range: DateRange,
  now: Date
): CategoryTrend {
  // Build a fixed set of buckets so the X-axis stays consistent.
  let points: CategoryTrendPoint[];
  if (range === "week") {
    const monday = startOfWeek(now);
    points = WEEK_DAYS.map((label, i) => ({
      label,
      timestamp: monday + i * DAY_MS,
    }));
  } else {
    // 30 days for month and a sliding 30 for "all" (so the chart stays compact).
    const todayStart = startOfDay(now.getTime());
    points = Array.from({ length: 30 }, (_, i) => {
      const dayStart = todayStart - (29 - i) * DAY_MS;
      const d = new Date(dayStart);
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        timestamp: dayStart,
      };
    });
  }

  const seriesMap = new Map<ActivityCategory, number[]>();
  const ensure = (c: ActivityCategory): number[] => {
    let arr = seriesMap.get(c);
    if (!arr) {
      arr = new Array(points.length).fill(0);
      seriesMap.set(c, arr);
    }
    return arr;
  };

  for (const { session } of sessions) {
    const dayStart = startOfDay(session.endedAt);
    const idx = points.findIndex((p) => p.timestamp === dayStart);
    if (idx === -1) continue;
    const hours = session.actualDurationSec / 3600;
    ensure(session.activityCategory)[idx] += hours;
  }

  const series = CATEGORY_ORDER.flatMap((category) => {
    const values = seriesMap.get(category);
    if (!values || values.every((v) => v === 0)) return [];
    return [{ category, values }];
  });

  const peak = series.reduce(
    (m, s) => Math.max(m, ...s.values),
    0
  );
  const maxHours = Math.max(1, Math.ceil(peak));

  return { points, series, maxHours };
}

function computeSummary(sessions: LoggedSession[]): InsightsSummary {
  let totalMinutes = 0;
  let naturalCount = 0;
  let focusSum = 0;
  let focusCount = 0;
  for (const { session, reflection } of sessions) {
    totalMinutes += session.actualDurationSec / 60;
    if (session.completedNaturally) naturalCount += 1;
    if (reflection && reflection.focusLevel > 0) {
      focusSum += reflection.focusLevel;
      focusCount += 1;
    }
  }
  return {
    totalMinutes: Math.round(totalMinutes),
    sessionCount: sessions.length,
    completionRate:
      sessions.length === 0 ? 0 : naturalCount / sessions.length,
    avgFocusRating: focusCount === 0 ? 0 : focusSum / focusCount,
  };
}

export function computeInsights(
  log: LoggedSession[],
  filters: InsightsFilters,
  now: Date = new Date()
): InsightsData {
  const bounds = rangeBounds(filters.dateRange, now);
  const filtered = applyFilters(log, filters, bounds);
  const sessions = filtered
    .slice()
    .sort((a, b) => b.session.endedAt - a.session.endedAt);

  return {
    summary: computeSummary(sessions),
    sessions,
    byCategory: computeByCategory(sessions),
    trend: computeTrend(sessions, filters.dateRange, now),
    logEmpty: log.length === 0,
  };
}

export function useInsightsData(filters: InsightsFilters): InsightsData {
  const log = useFocusStore((s) => s.sessionLog);
  const { dateRange, quickFilter, projectId } = filters;
  return useMemo(
    () => computeInsights(log, { dateRange, quickFilter, projectId }),
    [log, dateRange, quickFilter, projectId]
  );
}

export function categoryMeta(c: ActivityCategory) {
  return ACTIVITY_CATEGORIES[c];
}
