import { useFocusStore, type LoggedSession } from "./focusStore";
import type { FocusStatsData } from "../data/focusStats";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// Mon=0 … Sun=6, matching DAY_LABELS order.
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function bucketWeeklyStats(
  sessions: LoggedSession[],
  now: Date = new Date()
): FocusStatsData {
  const weekStart = startOfWeek(now);
  const weekEnd = weekStart + WEEK_MS;

  const dailyMinutes = [0, 0, 0, 0, 0, 0, 0];
  let totalMinutes = 0;
  let sessionCount = 0;
  let naturalCount = 0;

  for (const { session } of sessions) {
    if (session.endedAt < weekStart || session.endedAt >= weekEnd) continue;
    const idx = mondayIndex(new Date(session.endedAt));
    const minutes = session.actualDurationSec / 60;
    dailyMinutes[idx] += minutes;
    totalMinutes += minutes;
    sessionCount += 1;
    if (session.completedNaturally) naturalCount += 1;
  }

  const daily = dailyMinutes.map((m, i) => ({
    day: DAY_LABELS[i],
    hours: m / 60,
  }));

  const peakHours = Math.max(...daily.map((d) => d.hours));
  const maxYHours = Math.max(2, Math.ceil(peakHours));

  return {
    totalMinutes: Math.round(totalMinutes),
    sessionCount,
    completionRate: sessionCount === 0 ? 0 : naturalCount / sessionCount,
    daily,
    maxYHours,
  };
}

export function useWeeklyStats(): FocusStatsData {
  const sessionLog = useFocusStore((s) => s.sessionLog);
  return bucketWeeklyStats(sessionLog);
}
