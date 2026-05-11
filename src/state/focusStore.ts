import { create } from "zustand";

export type SessionStatus = "idle" | "running" | "paused";

const DEFAULT_DURATION_SEC = 35 * 60;

type Flags = {
  focusMode: boolean;
  notificationsMuted: boolean;
  distractionsBlocked: boolean;
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
};

export type FocusStore = FocusState & FocusActions;

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

  start: () =>
    set((s) => ({ status: "running", remainingSec: s.durationSec })),
  pause: () => set({ status: "paused" }),
  resume: () => set({ status: "running" }),
  end: () =>
    set((s) => ({ status: "idle", remainingSec: s.durationSec })),

  tick: () =>
    set((s) => {
      if (s.status !== "running") return s;
      if (s.remainingSec <= 1) {
        return { status: "idle", remainingSec: s.durationSec };
      }
      return { remainingSec: s.remainingSec - 1 };
    }),

  setDuration: (sec) => set({ durationSec: sec, remainingSec: sec }),
  setTier: (tierId) => set({ currentTierId: tierId }),
  setXp: (xp) => set({ xp }),
  setFocusStreak: (days) => set({ focusStreakDays: days }),
  setProjectStreak: (days) => set({ projectStreakDays: days }),
}));
