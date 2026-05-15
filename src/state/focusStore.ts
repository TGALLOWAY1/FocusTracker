import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { newId } from "../utils/id";
import { getTier } from "../data/focusTiers";
import type { ActivityCategory } from "../data/activityCategories";
import { useProjectStore } from "./projectStore";

export type SessionStatus = "idle" | "running" | "paused";

const DEFAULT_DURATION_SEC = 35 * 60;

const DEEP_WORK_THRESHOLD_MIN = 60;
const DEEP_WORK_MULTIPLIER = 3;
const NATURAL_COMPLETION_BONUS = 5;

type Flags = {
  focusMode: boolean;
  notificationsMuted: boolean;
  distractionsBlocked: boolean;
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  /** Wall-clock ms when the todo was checked off; null while unchecked. */
  completedAt: number | null;
};

export type DailyPlan = {
  projectId: string;
  projectName: string;
  primaryTask: string;
  todos: Todo[];
  plannedDurationMin: number;
  createdAt: number;
};

export type SessionType = "deep" | "light" | "learning";

// A per-todo record snapshotted into a completed session. `durationSec` is
// derived from checkoff timestamps at completion but is user-editable
// afterward (null = blank); `tag` is applied by the user after the fact.
export type TaskRecord = {
  id: string;
  text: string;
  completedAt: number | null;
  durationSec: number | null;
  tag: string | null;
};

export type CompletedSession = {
  id: string;
  projectId: string;
  /**
   * Snapshot of the project's display name at the time the session ended.
   * This is a historical label — never use it to look up the project.
   * For the live name, read `useFocusProjectName()` or look up
   * `useProjectStore().projects` by `projectId`.
   */
  projectName: string;
  task: string;
  startedAt: number;
  endedAt: number;
  plannedDurationSec: number;
  actualDurationSec: number;
  completedNaturally: boolean;
  activityCategory: ActivityCategory;
  sessionType: SessionType;
  tags: string[];
  taskRecords: TaskRecord[];
};

export type SessionReflection = {
  sessionId: string;
  focusLevel: number;
  energyLevel: number;
  reflection?: string;
  completedPlanned: boolean;
  createdAt: number;
};

export type LoggedSession = {
  session: CompletedSession;
  reflection: SessionReflection | null;
};

type ActiveProjectInput = {
  id: string;
  name: string;
};

type FocusState = {
  status: SessionStatus;
  projectId: string;
  task: string;
  todos: Todo[];
  durationSec: number;
  remainingSec: number;
  /**
   * Wall-clock ms when the running session started — the anchor for the
   * first todo's tracked duration. Transient: never persisted, so a
   * mid-session refresh (which can't resume anyway) leaves it null.
   */
  startedAt: number | null;
  nextBreak: { label: string; minutes: number };
  flags: Flags;
  currentTierId: number;
  xp: number;
  dailyPlan: DailyPlan | null;
  pendingReflectionFor: CompletedSession | null;
  sessionLog: LoggedSession[];
};

type FocusActions = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  tick: () => void;
  setActiveProject: (project: ActiveProjectInput) => void;
  setDuration: (sec: number) => void;
  setTier: (tierId: number) => void;
  setXp: (xp: number) => void;
  setDailyPlan: (plan: DailyPlan) => void;
  clearDailyPlan: () => void;
  toggleTodo: (todoId: string) => void;
  updateTaskRecord: (
    sessionId: string,
    taskId: string,
    patch: { durationSec?: number | null; tag?: string | null }
  ) => void;
  submitReflection: (reflection: SessionReflection) => void;
  dismissReflection: () => void;
  deleteSession: (sessionId: string) => void;
  discardPendingSession: () => void;
};

export type FocusStore = FocusState & FocusActions;

function lookupActivityCategory(projectId: string): ActivityCategory {
  const project = useProjectStore
    .getState()
    .projects.find((p) => p.id === projectId);
  return project?.activityCategory ?? "other";
}

// Resolves the project's current display name at the time of the call.
// Used by buildCompletion to snapshot a historical label onto each
// CompletedSession — that snapshot is what SessionRow / ProjectDetail
// render later, so a project rename never rewrites past history.
function lookupProjectName(projectId: string): string {
  const project = useProjectStore
    .getState()
    .projects.find((p) => p.id === projectId);
  return project?.name ?? "Unknown Project";
}

function deriveSessionType(
  category: ActivityCategory,
  actualDurationSec: number
): SessionType {
  if (category === "learning" || category === "reading") return "learning";
  const minutes = actualDurationSec / 60;
  return minutes >= DEEP_WORK_THRESHOLD_MIN ? "deep" : "light";
}

function buildTags(opts: {
  category: ActivityCategory;
  sessionType: SessionType;
  completedNaturally: boolean;
}): string[] {
  const categoryLabel =
    opts.category.charAt(0).toUpperCase() + opts.category.slice(1);
  const tags: string[] = [];
  if (opts.sessionType === "deep") tags.push("Deep Work");
  if (opts.sessionType === "learning") tags.push("Learning");
  if (opts.sessionType === "light") tags.push("Light Work");
  if (categoryLabel !== "Other" && !tags.includes(categoryLabel)) {
    tags.push(categoryLabel);
  }
  if (opts.completedNaturally) tags.push("Completed");
  return tags;
}

// Snapshots the session's todos into TaskRecords. Each checked-off todo's
// duration is the wall-clock gap from the previous checkoff (the first
// anchored to the session start). Durations therefore reflect checkoff
// ORDER, not list order, and include any paused time — both acceptable
// because the values are user-editable in the Insights history afterward.
// Un-checked todos carry a null duration (blank) for the user to fill in.
function buildTaskRecords(
  todos: Todo[],
  sessionStartedAt: number
): TaskRecord[] {
  const checked = todos
    .filter((t) => t.completedAt != null)
    .sort((a, b) => (a.completedAt as number) - (b.completedAt as number));
  const durationById = new Map<string, number>();
  let prev = sessionStartedAt;
  for (const t of checked) {
    const at = t.completedAt as number;
    durationById.set(t.id, Math.max(0, Math.round((at - prev) / 1000)));
    prev = at;
  }
  return todos.map((t) => ({
    id: t.id,
    text: t.text,
    completedAt: t.completedAt ?? null,
    durationSec: durationById.get(t.id) ?? null,
    tag: null,
  }));
}

function buildCompletion(
  state: FocusState,
  completedNaturally: boolean
): CompletedSession {
  const openEnded = state.durationSec === 0;
  const actualDurationSec = completedNaturally
    ? state.durationSec
    : openEnded
      ? state.remainingSec
      : Math.max(0, state.durationSec - state.remainingSec);
  const endedAt = Date.now();
  const startedAt = endedAt - actualDurationSec * 1000;
  const category = lookupActivityCategory(state.projectId);
  const sessionType = deriveSessionType(category, actualDurationSec);
  const tags = buildTags({
    category,
    sessionType,
    completedNaturally,
  });

  return {
    id: newId("session"),
    projectId: state.projectId,
    projectName: lookupProjectName(state.projectId),
    task: state.task,
    startedAt,
    endedAt,
    plannedDurationSec: state.durationSec,
    actualDurationSec,
    completedNaturally,
    activityCategory: category,
    sessionType,
    tags,
    taskRecords: buildTaskRecords(state.todos, state.startedAt ?? startedAt),
  };
}

// First DEEP_WORK_THRESHOLD_MIN minutes earn 1 XP/min; minutes past the
// threshold earn DEEP_WORK_MULTIPLIER× — rewards sustained focus. Natural
// completion adds a flat bonus so finishing the timer matters.
export function xpForSession(session: CompletedSession): number {
  const mins = Math.floor(session.actualDurationSec / 60);
  const baseMins = Math.min(DEEP_WORK_THRESHOLD_MIN, mins);
  const deepMins = Math.max(0, mins - DEEP_WORK_THRESHOLD_MIN);
  const fromTime = baseMins + deepMins * DEEP_WORK_MULTIPLIER;
  return fromTime + (session.completedNaturally ? NATURAL_COMPLETION_BONUS : 0);
}

// Adds `award` XP and walks the tier ladder forward, rolling overflow into
// the next tier. Stops once the current tier's xpToNext is unmet, or the
// peak tier is reached (xpToNext = Infinity).
export function applyXpAward(
  currentTierId: number,
  xp: number,
  award: number
): { currentTierId: number; xp: number } {
  let tierId = currentTierId;
  let total = xp + award;
  while (true) {
    const tier = getTier(tierId);
    if (!tier || !Number.isFinite(tier.xpToNext) || total < tier.xpToNext) {
      break;
    }
    total -= tier.xpToNext;
    tierId += 1;
  }
  return { currentTierId: tierId, xp: total };
}

export function calculateTierState(totalXp: number): { currentTierId: number; xp: number } {
  let tierId = 1;
  let remaining = Math.max(0, totalXp);
  while (true) {
    const tier = getTier(tierId);
    if (!tier || !Number.isFinite(tier.xpToNext) || remaining < tier.xpToNext) {
      break;
    }
    remaining -= tier.xpToNext;
    tierId += 1;
  }
  return { currentTierId: tierId, xp: remaining };
}

export function getTotalXp(state: FocusState): number {
  let total = state.xp;
  for (let i = 1; i < state.currentTierId; i++) {
    const t = getTier(i);
    if (t) total += t.xpToNext;
  }
  return total;
}

// Migration helper: backfills `completedAt` onto a legacy persisted todo
// (pre-v5 todos lacked the field).
function withCompletedAt(todo: unknown): unknown {
  if (!todo || typeof todo !== "object") return todo;
  const t = todo as Record<string, unknown>;
  return {
    ...t,
    completedAt: typeof t.completedAt === "number" ? t.completedAt : null,
  };
}

type PersistedFocus = Pick<
  FocusState,
  | "projectId"
  | "task"
  | "todos"
  | "durationSec"
  | "flags"
  | "currentTierId"
  | "xp"
  | "dailyPlan"
  | "sessionLog"
>;

// Applies the lifecycle side-effects of a completed session: appends the
// session to `sessionLog` with `reflection: null` (committed immediately so
// a page refresh between completion and reflection-submit doesn't lose the
// work), awards XP, and sets `pendingReflectionFor` so the reflection
// modal can attach to the just-completed session. Subsequent
// submit/dismiss only update the reflection field in place.
function applyCompletion(state: FocusState, completedNaturally: boolean) {
  const completion = buildCompletion(state, completedNaturally);
  const award = xpForSession(completion);
  const next = applyXpAward(state.currentTierId, state.xp, award);
  return {
    status: "idle" as SessionStatus,
    remainingSec: state.durationSec,
    pendingReflectionFor: completion,
    currentTierId: next.currentTierId,
    xp: next.xp,
    sessionLog: [
      { session: completion, reflection: null },
      ...state.sessionLog,
    ],
  };
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      status: "idle" as SessionStatus,
      // Must reference a real entry in projectStore's SEED_PROJECTS; before
      // Slice 3 a hardcoded `project: "Harmonia EP"` label masked the fact
      // that `projectId: "harmonia-ep"` didn't resolve to any seed.
      projectId: "lofi-beats-collection",
      task: "Mixing and arrangement",
      todos: [],
      durationSec: DEFAULT_DURATION_SEC,
      remainingSec: DEFAULT_DURATION_SEC,
      startedAt: null,
      nextBreak: { label: "Short Break", minutes: 5 },
      flags: {
        focusMode: true,
        notificationsMuted: true,
        distractionsBlocked: true,
      },
      currentTierId: 1,
      xp: 0,
      dailyPlan: null,
      pendingReflectionFor: null,
      sessionLog: [],

      start: () =>
        set((s) => ({
          status: "running",
          remainingSec: s.durationSec,
          startedAt: Date.now(),
        })),
      pause: () => set({ status: "paused" }),
      resume: () => set({ status: "running" }),

      end: () =>
        set((s) => {
          if (s.status !== "running") return s;
          return applyCompletion(s, false);
        }),

      tick: () =>
        set((s) => {
          if (s.status !== "running") return s;
          if (s.durationSec > 0 && s.remainingSec <= 1) {
            return applyCompletion(s, true);
          }
          if (s.durationSec === 0) {
            return { remainingSec: s.remainingSec + 1 };
          }
          return { remainingSec: s.remainingSec - 1 };
        }),

      // The `name` field on the input is accepted for caller ergonomics
      // but intentionally ignored — the live name is derived from
      // projectStore at read time, so a rename propagates everywhere.
      setActiveProject: (project) => set({ projectId: project.id }),
      setDuration: (sec) => set({ durationSec: sec, remainingSec: sec }),
      setTier: (tierId) => set({ currentTierId: tierId }),
      setXp: (xp) => set({ xp }),

      setDailyPlan: (plan) =>
        set((s) => {
          const newDurationSec = plan.plannedDurationMin * 60;
          const active = s.status === "running" || s.status === "paused";
          return {
            dailyPlan: plan,
            projectId: plan.projectId,
            task: plan.primaryTask,
            todos: plan.todos,
            durationSec: newDurationSec,
            remainingSec: active ? s.remainingSec : newDurationSec,
            // Re-planning mid-session swaps in fresh todos — re-anchor their
            // timing baseline so the first one isn't credited stale time.
            startedAt: active ? Date.now() : s.startedAt,
          };
        }),
      clearDailyPlan: () => set({ dailyPlan: null }),

      toggleTodo: (todoId) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === todoId
              ? {
                  ...t,
                  done: !t.done,
                  completedAt: t.done ? null : Date.now(),
                }
              : t
          ),
        })),

      updateTaskRecord: (sessionId, taskId, patch) =>
        set((s) => ({
          sessionLog: s.sessionLog.map((entry) =>
            entry.session.id === sessionId
              ? {
                  ...entry,
                  session: {
                    ...entry.session,
                    taskRecords: entry.session.taskRecords.map((tr) =>
                      tr.id === taskId ? { ...tr, ...patch } : tr
                    ),
                  },
                }
              : entry
          ),
        })),

      // The session was already appended to `sessionLog` (with
      // `reflection: null`) and XP was already awarded at completion.
      // We just attach the reflection to the matching log entry, then
      // clear the pending pointer that drove the modal.
      submitReflection: (reflection) =>
        set((s) => {
          if (!s.pendingReflectionFor) return s;
          const targetId = s.pendingReflectionFor.id;
          return {
            pendingReflectionFor: null,
            sessionLog: s.sessionLog.map((entry) =>
              entry.session.id === targetId
                ? { ...entry, reflection }
                : entry
            ),
          };
        }),

      // Skipping reflection is a UX opt-out, not a forfeit. The session
      // and XP are already committed; just close the modal.
      dismissReflection: () => set({ pendingReflectionFor: null }),

      deleteSession: (sessionId) =>
        set((s) => {
          const entry = s.sessionLog.find((e) => e.session.id === sessionId);
          if (!entry) return s;
          const sessionXp = xpForSession(entry.session);
          const totalXp = Math.max(0, getTotalXp(s) - sessionXp);
          const newTierState = calculateTierState(totalXp);
          return {
            sessionLog: s.sessionLog.filter((e) => e.session.id !== sessionId),
            currentTierId: newTierState.currentTierId,
            xp: newTierState.xp,
          };
        }),

      discardPendingSession: () =>
        set((s) => {
          if (!s.pendingReflectionFor) return s;
          const targetId = s.pendingReflectionFor.id;
          const entry = s.sessionLog.find((e) => e.session.id === targetId);
          if (!entry) return { pendingReflectionFor: null };
          const sessionXp = xpForSession(entry.session);
          const totalXp = Math.max(0, getTotalXp(s) - sessionXp);
          const newTierState = calculateTierState(totalXp);
          return {
            pendingReflectionFor: null,
            sessionLog: s.sessionLog.filter((e) => e.session.id !== targetId),
            currentTierId: newTierState.currentTierId,
            xp: newTierState.xp,
          };
        }),
    }),
    {
      name: "focus-ladder.focus",
      version: 5,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedFocus => ({
        projectId: state.projectId,
        task: state.task,
        todos: state.todos,
        durationSec: state.durationSec,
        flags: state.flags,
        currentTierId: state.currentTierId,
        xp: state.xp,
        dailyPlan: state.dailyPlan,
        sessionLog: state.sessionLog,
      }),
      // v2 -> v3 dropped focusStreakDays / projectStreakDays (streaks are
      // derived from sessionLog at read time).
      // v3 -> v4 dropped the top-level `project` (live name is derived
      // from projectStore via useFocusProjectName) and renamed each
      // sessionLog entry's `session.project` to `session.projectName`
      // to make its snapshot-not-key semantics explicit.
      // v4 -> v5 added per-task timing: `taskRecords` on each completed
      // session and `completedAt` on every Todo.
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }
        const next: Record<string, unknown> = {
          ...(persistedState as Record<string, unknown>),
        };
        if (version < 3) {
          delete next.focusStreakDays;
          delete next.projectStreakDays;
        }
        if (version < 4) {
          delete next.project;
          // The legacy default `projectId` never resolved to a real seed
          // project — rescue users whose persisted state still carries it.
          if (next.projectId === "harmonia-ep") {
            next.projectId = "lofi-beats-collection";
          }
          const log = next.sessionLog;
          if (Array.isArray(log)) {
            next.sessionLog = log.map((entry) => {
              if (!entry || typeof entry !== "object") return entry;
              const e = entry as { session?: Record<string, unknown> };
              if (!e.session || typeof e.session !== "object") return entry;
              const { project, ...rest } = e.session as {
                project?: unknown;
                projectName?: unknown;
              } & Record<string, unknown>;
              return {
                ...entry,
                session: {
                  ...rest,
                  projectName: rest.projectName ?? project ?? "Unknown Project",
                },
              };
            });
          }
        }
        if (version < 5) {
          const log = next.sessionLog;
          if (Array.isArray(log)) {
            next.sessionLog = log.map((entry) => {
              if (!entry || typeof entry !== "object") return entry;
              const e = entry as { session?: Record<string, unknown> };
              if (!e.session || typeof e.session !== "object") return entry;
              return {
                ...entry,
                session: {
                  ...e.session,
                  taskRecords: Array.isArray(e.session.taskRecords)
                    ? e.session.taskRecords
                    : [],
                },
              };
            });
          }
          if (Array.isArray(next.todos)) {
            next.todos = next.todos.map(withCompletedAt);
          }
          if (next.dailyPlan && typeof next.dailyPlan === "object") {
            const dp = next.dailyPlan as Record<string, unknown>;
            if (Array.isArray(dp.todos)) {
              next.dailyPlan = { ...dp, todos: dp.todos.map(withCompletedAt) };
            }
          }
        }
        return next;
      },
      // Always boot into idle on rehydration: a refresh mid-session
      // shouldn't resume a stale countdown, and a half-finished
      // reflection shouldn't reappear if the user closed the tab.
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<PersistedFocus>;
        const durationSec = persisted.durationSec ?? currentState.durationSec;
        return {
          ...currentState,
          ...persisted,
          status: "idle" as SessionStatus,
          remainingSec: durationSec,
          pendingReflectionFor: null,
        };
      },
    }
  )
);
