import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SEED_PROJECTS,
  presetForColor,
  type Project,
  type ProjectColor,
} from "../data/projects";

type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
};

type LegacyV2Project = {
  id: string;
  name: string;
  category?: string;
  weeklyMinutes?: number;
  weeklyGoalMinutes?: number;
  color: ProjectColor;
  iconKey: Project["iconKey"];
  activityCategory: Project["activityCategory"];
};

function migrateProject(p: LegacyV2Project): Project {
  const now = Date.now();
  return {
    id: p.id,
    name: p.name,
    description: "",
    category: p.category ?? "",
    status: "active",
    tags: [],
    weeklyMinutes: p.weeklyMinutes ?? 0,
    weeklyGoalMinutes: p.weeklyGoalMinutes ?? 600,
    progressPercent: 0,
    color: p.color,
    iconKey: p.iconKey,
    activityCategory: p.activityCategory,
    cover: { kind: "preset", preset: presetForColor(p.color) },
    manualEntries: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: SEED_PROJECTS,
      setProjects: (projects) => set({ projects }),
      upsertProject: (project) =>
        set((s) => {
          const stamped: Project = { ...project, updatedAt: Date.now() };
          const idx = s.projects.findIndex((p) => p.id === project.id);
          if (idx === -1) return { projects: [...s.projects, stamped] };
          const next = s.projects.slice();
          next[idx] = stamped;
          return { projects: next };
        }),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    {
      name: "focus-ladder.projects",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, fromVersion) => {
        const state = (persistedState ?? {}) as { projects?: unknown[] };
        const raw = Array.isArray(state.projects) ? state.projects : [];
        if (fromVersion < 3) {
          return {
            projects: raw.map((p) => migrateProject(p as LegacyV2Project)),
          };
        }
        return state as { projects: Project[] };
      },
    }
  )
);
