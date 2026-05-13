import type {
  CompletedSession,
  LoggedSession,
  SessionReflection,
  SessionType,
} from "../focusStore";
import type { ActivityCategory } from "../../data/activityCategories";
import { epochMsToIso, isoToEpochMs } from "../../lib/dbDates";

export type SessionRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  task: string;
  started_at: string;
  ended_at: string;
  planned_duration_sec: number;
  actual_duration_sec: number;
  completed_naturally: boolean;
  activity_category: ActivityCategory;
  session_type: SessionType;
  tags: string[];
  created_at?: string;
};

export type ReflectionRow = {
  session_id: string;
  user_id: string;
  focus_level: number;
  energy_level: number;
  reflection: string | null;
  completed_planned: boolean;
  created_at?: string;
};

export type SessionRowWithReflection = SessionRow & {
  focus_reflections: ReflectionRow[] | ReflectionRow | null;
};

export function sessionToRow(
  session: CompletedSession,
  userId: string
): SessionRow {
  return {
    id: session.id,
    user_id: userId,
    project_id: session.projectId || null,
    project_name: session.projectName,
    task: session.task,
    started_at: epochMsToIso(session.startedAt),
    ended_at: epochMsToIso(session.endedAt),
    planned_duration_sec: session.plannedDurationSec,
    actual_duration_sec: session.actualDurationSec,
    completed_naturally: session.completedNaturally,
    activity_category: session.activityCategory,
    session_type: session.sessionType,
    tags: session.tags,
  };
}

export function rowToSession(row: SessionRow): CompletedSession {
  return {
    id: row.id,
    projectId: row.project_id ?? "",
    projectName: row.project_name,
    task: row.task,
    startedAt: isoToEpochMs(row.started_at),
    endedAt: isoToEpochMs(row.ended_at),
    plannedDurationSec: row.planned_duration_sec,
    actualDurationSec: row.actual_duration_sec,
    completedNaturally: row.completed_naturally,
    activityCategory: row.activity_category,
    sessionType: row.session_type,
    tags: row.tags ?? [],
  };
}

export function reflectionToRow(
  reflection: SessionReflection,
  userId: string
): ReflectionRow {
  return {
    session_id: reflection.sessionId,
    user_id: userId,
    focus_level: reflection.focusLevel,
    energy_level: reflection.energyLevel,
    reflection: reflection.reflection ?? null,
    completed_planned: reflection.completedPlanned,
  };
}

export function rowToReflection(row: ReflectionRow): SessionReflection {
  return {
    sessionId: row.session_id,
    focusLevel: row.focus_level,
    energyLevel: row.energy_level,
    reflection: row.reflection ?? undefined,
    completedPlanned: row.completed_planned,
    createdAt: row.created_at ? isoToEpochMs(row.created_at) : Date.now(),
  };
}

// Supabase returns embedded rows as arrays even for 1:1 FKs; normalize.
export function joinRowToLoggedSession(
  row: SessionRowWithReflection
): LoggedSession {
  const reflectionRow = Array.isArray(row.focus_reflections)
    ? row.focus_reflections[0] ?? null
    : row.focus_reflections ?? null;
  return {
    session: rowToSession(row),
    reflection: reflectionRow ? rowToReflection(reflectionRow) : null,
  };
}
