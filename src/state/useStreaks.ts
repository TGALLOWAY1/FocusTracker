import { useFocusStore, type LoggedSession } from "./focusStore";

export type StreaksData = {
  focusStreakDays: number;
  projectStreakDays: number;
};

// Local-day key derived from epoch millis. Using getFullYear/Month/Date
// (not endedAt - DAY_MS arithmetic) keeps this DST-safe: each civil
// day produces a distinct key regardless of whether the day was 23, 24,
// or 25 hours long.
function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function previousDayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const prev = new Date(y, m, d - 1);
  return `${prev.getFullYear()}-${prev.getMonth()}-${prev.getDate()}`;
}

function countTrailingDays(daySet: Set<string>, now: Date): number {
  if (daySet.size === 0) return 0;

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const yesterdayKey = previousDayKey(todayKey);

  // Streak is alive only if there was a session today or yesterday.
  let cursor: string;
  if (daySet.has(todayKey)) {
    cursor = todayKey;
  } else if (daySet.has(yesterdayKey)) {
    cursor = yesterdayKey;
  } else {
    return 0;
  }

  let count = 0;
  while (daySet.has(cursor)) {
    count += 1;
    cursor = previousDayKey(cursor);
  }
  return count;
}

export function computeStreaks(
  sessions: LoggedSession[],
  activeProjectId: string,
  now: Date = new Date()
): StreaksData {
  const allDays = new Set<string>();
  const projectDays = new Set<string>();

  for (const { session } of sessions) {
    const key = dayKey(session.endedAt);
    allDays.add(key);
    if (session.projectId === activeProjectId) {
      projectDays.add(key);
    }
  }

  return {
    focusStreakDays: countTrailingDays(allDays, now),
    projectStreakDays: countTrailingDays(projectDays, now),
  };
}

export function useStreaks(): StreaksData {
  const sessionLog = useFocusStore((s) => s.sessionLog);
  const projectId = useFocusStore((s) => s.projectId);
  return computeStreaks(sessionLog, projectId);
}
