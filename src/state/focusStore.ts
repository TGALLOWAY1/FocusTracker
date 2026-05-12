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

export type DailyPlan = {
  projectId: string;
  projectName: string;
  primaryTask: string;
  secondaryTask?: string;
  plannedDurationMin: number;
  createdAt: number;
};

export type SessionType = "deep" | "light" | "learning";

export type CompletedSession = {
  id: string;
  projectId: string;
  project: string;
  task: string;
  startedAt: number;
  endedAt: number;
  plannedDurationSec: number;
  actualDurationSec: number;
  completedNaturally: boolean;
  activityCategory: ActivityCategory;
  sessionType: SessionType;
  tags: string[];
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
  project: string;
  task: string;
  durationSec: number;
  remainingSec: number;
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
  submitReflection: (reflection: SessionReflection) => void;
  dismissReflection: () => void;
};

export type FocusStore = FocusState & FocusActions;

function lookupActivityCategory(projectId: string): ActivityCategory {
  const project = useProjectStore
    .getState()
    .projects.find((p) => p.id === projectId);
  return project?.activityCategory ?? "other";
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

function buildCompletion(
  state: FocusState,
  completedNaturally: boolean
): CompletedSession {
  const elapsed = Math.max(0, state.durationSec - state.remainingSec);
  const actualDurationSec = completedNaturally ? state.durationSec : elapsed;
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
    project: state.project,
    task: state.task,
    startedAt,
    endedAt,
    plannedDurationSec: state.durationSec,
    actualDurationSec,
    completedNaturally,
    activityCategory: category,
    sessionType,
    tags,
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

type PersistedFocus = Pick<
  FocusState,
  | "projectId"
  | "project"
  | "task"
  | "durationSec"
  | "flags"
  | "currentTierId"
  | "xp"
  | "dailyPlan"
  | "sessionLog"
>;

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      status: "idle" as SessionStatus,
      projectId: "harmonia-ep",
      project: "Harmonia EP",
      task: "Mixing and arrangement",
      durationSec: DEFAULT_DURATION_SEC,
      remainingSec: DEFAULT_DURATION_SEC,
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
        set((s) => ({ status: "running", remainingSec: s.durationSec })),
      pause: () => set({ status: "paused" }),
      resume: () => set({ status: "running" }),

      end: () =>
        set((s) => ({
          status: "idle",
          remainingSec: s.durationSec,
          pendingReflectionFor: buildCompletion(s, false),
        })),

      tick: () =>
        set((s) => {
          if (s.status !== "running") return s;
          if (s.remainingSec <= 1) {
            return {
              status: "idle",
              remainingSec: s.durationSec,
              pendingReflectionFor: buildCompletion(s, true),
            };
          }
          return { remainingSec: s.remainingSec - 1 };
        }),

      setActiveProject: (project) =>
        set({ projectId: project.id, project: project.name }),
      setDuration: (sec) => set({ durationSec: sec, remainingSec: sec }),
      setTier: (tierId) => set({ currentTierId: tierId }),
      setXp: (xp) => set({ xp }),

      setDailyPlan: (plan) =>
        set((s) => {
          const newDurationSec = plan.plannedDurationMin * 60;
          return {
            dailyPlan: plan,
            projectId: plan.projectId,
            project: plan.projectName,
            task: plan.primaryTask,
            durationSec: newDurationSec,
            remainingSec:
              s.status === "running" || s.status === "paused"
                ? s.remainingSec
                : newDurationSec,
          };
        }),
      clearDailyPlan: () => set({ dailyPlan: null }),

      submitReflection: (reflection) =>
        set((s) => {
          if (!s.pendingReflectionFor) return s;
          const award = xpForSession(s.pendingReflectionFor);
          const next = applyXpAward(s.currentTierId, s.xp, award);
          return {
            pendingReflectionFor: null,
            currentTierId: next.currentTierId,
            xp: next.xp,
            sessionLog: [
              { session: s.pendingReflectionFor, reflection },
              ...s.sessionLog,
            ],
          };
        }),

      dismissReflection: () =>
        set((s) => {
          if (!s.pendingReflectionFor) return s;
          const award = xpForSession(s.pendingReflectionFor);
          const next = applyXpAward(s.currentTierId, s.xp, award);
          return {
            pendingReflectionFor: null,
            currentTierId: next.currentTierId,
            xp: next.xp,
            sessionLog: [
              { session: s.pendingReflectionFor, reflection: null },
              ...s.sessionLog,
            ],
          };
        }),
    }),
    {
      name: "focus-ladder.focus",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedFocus => ({
        projectId: state.projectId,
        project: state.project,
        task: state.task,
        durationSec: state.durationSec,
        flags: state.flags,
        currentTierId: state.currentTierId,
        xp: state.xp,
        dailyPlan: state.dailyPlan,
        sessionLog: state.sessionLog,
      }),
      // v2 -> v3 dropped focusStreakDays / projectStreakDays from persisted
      // state (streaks are now derived from sessionLog at read time). Strip
      // them so the persisted JSON stays clean.
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }
        if (version < 3) {
          const rest: Record<string, unknown> = { ...(persistedState as Record<string, unknown>) };
          delete rest.focusStreakDays;
          delete rest.projectStreakDays;
          return rest;
        }
        return persistedState;
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
