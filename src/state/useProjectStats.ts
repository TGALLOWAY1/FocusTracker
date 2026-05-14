import { useMemo } from "react";
import { useFocusStore, type LoggedSession } from "./focusStore";
import { useProjectStore } from "./projectStore";
import type { ManualEntry, Project } from "../data/projects";

export type ProjectStats = {
  totalMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  sessionCount: number;
  lastActivityAt: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

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

function startOfMonth(now: Date): number {
  return startOfDay(now.getTime()) - 29 * DAY_MS;
}

export function computeProjectStats(
  projectId: string,
  log: LoggedSession[],
  manualEntries: ManualEntry[],
  now: Date = new Date()
): ProjectStats {
  const weekFrom = startOfWeek(now);
  const monthFrom = startOfMonth(now);

  let totalMinutes = 0;
  let weekMinutes = 0;
  let monthMinutes = 0;
  let sessionCount = 0;
  let lastActivityAt: number | null = null;

  for (const { session } of log) {
    if (session.projectId !== projectId) continue;
    const minutes = session.actualDurationSec / 60;
    totalMinutes += minutes;
    sessionCount += 1;
    if (session.endedAt >= weekFrom) weekMinutes += minutes;
    if (session.endedAt >= monthFrom) monthMinutes += minutes;
    if (lastActivityAt === null || session.endedAt > lastActivityAt) {
      lastActivityAt = session.endedAt;
    }
  }

  for (const entry of manualEntries) {
    totalMinutes += entry.minutes;
    if (entry.addedAt >= weekFrom) weekMinutes += entry.minutes;
    if (entry.addedAt >= monthFrom) monthMinutes += entry.minutes;
    if (lastActivityAt === null || entry.addedAt > lastActivityAt) {
      lastActivityAt = entry.addedAt;
    }
  }

  return {
    totalMinutes: Math.round(totalMinutes),
    weekMinutes: Math.round(weekMinutes),
    monthMinutes: Math.round(monthMinutes),
    sessionCount,
    lastActivityAt,
  };
}

export function useProjectStats(projectId: string): ProjectStats {
  const log = useFocusStore((s) => s.sessionLog);
  const manualEntries = useProjectStore(
    (s) => s.projects.find((p) => p.id === projectId)?.manualEntries
  );
  return useMemo(
    () => computeProjectStats(projectId, log, manualEntries ?? []),
    [projectId, log, manualEntries]
  );
}

export function useAllProjectStats(): Map<string, ProjectStats> {
  const log = useFocusStore((s) => s.sessionLog);
  const projects = useProjectStore((s) => s.projects);
  return useMemo(() => {
    const map = new Map<string, ProjectStats>();
    for (const p of projects) {
      map.set(p.id, computeProjectStats(p.id, log, p.manualEntries));
    }
    return map;
  }, [projects, log]);
}

export function sortProjects(
  projects: Project[],
  stats: Map<string, ProjectStats>,
  sort: "recent" | "name" | "progress" | "focusTime"
): Project[] {
  const copy = projects.slice();
  switch (sort) {
    case "name":
      copy.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "progress":
      copy.sort((a, b) => b.progressPercent - a.progressPercent);
      break;
    case "focusTime":
      copy.sort(
        (a, b) =>
          (stats.get(b.id)?.totalMinutes ?? 0) -
          (stats.get(a.id)?.totalMinutes ?? 0)
      );
      break;
    case "recent":
    default:
      copy.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
  }
  return copy;
}
