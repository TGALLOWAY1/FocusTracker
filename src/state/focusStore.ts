import { create } from "zustand";
import { newId } from "../utils/id";

export type SessionStatus = "idle" | "running" | "paused";

const DEFAULT_DURATION_SEC = 35 * 60;

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

export type CompletedSession = {
  id: string;
  project: string;
  task: string;
  plannedDurationSec: number;
  actualDurationSec: number;
  endedAt: number;
  completedNaturally: boolean;
};

export type SessionReflection = {
  sessionId: string;
  focusLevel: number;
  energyLevel: number;
  biggestDistraction?: string;
  completedPlanned: boolean;
  createdAt: number;
};

export type LoggedSession = {
  session: CompletedSession;
  reflection: SessionReflection | null;
};

type FocusState = {
  status: SessionStatus;
  project: string;
  task: string;
  durationSec: number;
  remainingSec: number;
  nextBreak: { label: string; minutes: number };
  flags: Flags;
  currentTierId: number;
  xp: number;
  focusStreakDays: number;
  projectStreakDays: number;
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
  setDuration: (sec: number) => void;
  setTier: (tierId: number) => void;
  setXp: (xp: number) => void;
  setFocusStreak: (days: number) => void;
  setProjectStreak: (days: number) => void;
  setDailyPlan: (plan: DailyPlan) => void;
  clearDailyPlan: () => void;
  submitReflection: (reflection: SessionReflection) => void;
  dismissReflection: () => void;
};

export type FocusStore = FocusState & FocusActions;

function buildCompletion(
  state: FocusState,
  completedNaturally: boolean
): CompletedSession {
  const elapsed = Math.max(0, state.durationSec - state.remainingSec);
  return {
    id: newId("session"),
    project: state.project,
    task: state.task,
    plannedDurationSec: state.durationSec,
    actualDurationSec: completedNaturally ? state.durationSec : elapsed,
    endedAt: Date.now(),
    completedNaturally,
  };
}

export const useFocusStore = create<FocusStore>((set) => ({
  status: "running",
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
  currentTierId: 3,
  xp: 1250,
  focusStreakDays: 14,
  projectStreakDays: 7,
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

  setDuration: (sec) => set({ durationSec: sec, remainingSec: sec }),
  setTier: (tierId) => set({ currentTierId: tierId }),
  setXp: (xp) => set({ xp }),
  setFocusStreak: (days) => set({ focusStreakDays: days }),
  setProjectStreak: (days) => set({ projectStreakDays: days }),

  setDailyPlan: (plan) =>
    set((s) => {
      const newDurationSec = plan.plannedDurationMin * 60;
      return {
        dailyPlan: plan,
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
      return {
        pendingReflectionFor: null,
        sessionLog: [
          { session: s.pendingReflectionFor, reflection },
          ...s.sessionLog,
        ],
      };
    }),

  dismissReflection: () =>
    set((s) => {
      if (!s.pendingReflectionFor) return s;
      return {
        pendingReflectionFor: null,
        sessionLog: [
          { session: s.pendingReflectionFor, reflection: null },
          ...s.sessionLog,
        ],
      };
    }),
}));
