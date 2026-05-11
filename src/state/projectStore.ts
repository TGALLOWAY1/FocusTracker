import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_PROJECTS, type Project } from "../data/projects";

type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: SEED_PROJECTS,
      setProjects: (projects) => set({ projects }),
      upsertProject: (project) =>
        set((s) => {
          const idx = s.projects.findIndex((p) => p.id === project.id);
          if (idx === -1) return { projects: [...s.projects, project] };
          const next = s.projects.slice();
          next[idx] = project;
          return { projects: next };
        }),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    {
      name: "focus-ladder.projects",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
