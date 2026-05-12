import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SEED_PROJECTS,
  presetForColor,
  type Project,
  type ProjectColor,
  type ProjectEvent,
  type ProjectEventKind,
  type ProjectLink,
  type ProjectNote,
  type ProjectTask,
} from "../data/projects";
import { newId } from "../utils/id";

const EVENT_CAP = 50;

type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
  addTask: (
    projectId: string,
    task: { title: string; category?: string; dueDate?: string }
  ) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  removeTask: (projectId: string, taskId: string) => void;
  addNote: (
    projectId: string,
    note: { title: string; body: string; pinned?: boolean }
  ) => void;
  updateNote: (
    projectId: string,
    noteId: string,
    patch: Partial<Pick<ProjectNote, "title" | "body" | "pinned">>
  ) => void;
  removeNote: (projectId: string, noteId: string) => void;
  addLink: (
    projectId: string,
    link: { title: string; url: string; icon?: ProjectLink["icon"] }
  ) => void;
  removeLink: (projectId: string, linkId: string) => void;
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

function appendEvent(
  project: Project,
  kind: ProjectEventKind,
  title: string
): ProjectEvent[] {
  const event: ProjectEvent = {
    id: newId("evt"),
    kind,
    title,
    at: Date.now(),
  };
  const next = [event, ...(project.events ?? [])];
  return next.slice(0, EVENT_CAP);
}

function mutateProject(
  projects: Project[],
  projectId: string,
  fn: (project: Project) => Project
): Project[] {
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return projects;
  const next = projects.slice();
  next[idx] = { ...fn(projects[idx]), updatedAt: Date.now() };
  return next;
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
      addTask: (projectId, { title, category, dueDate }) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => {
            const task: ProjectTask = {
              id: newId("task"),
              title,
              completed: false,
              category,
              dueDate,
              createdAt: Date.now(),
            };
            return {
              ...p,
              tasks: [...(p.tasks ?? []), task],
              events: appendEvent(p, "task_added", title),
            };
          }),
        })),
      toggleTask: (projectId, taskId) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => {
            const tasks = (p.tasks ?? []).map((t) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            );
            const toggled = tasks.find((t) => t.id === taskId);
            const events =
              toggled && toggled.completed
                ? appendEvent(p, "task_completed", toggled.title)
                : p.events;
            return { ...p, tasks, events };
          }),
        })),
      removeTask: (projectId, taskId) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => ({
            ...p,
            tasks: (p.tasks ?? []).filter((t) => t.id !== taskId),
          })),
        })),
      addNote: (projectId, { title, body, pinned }) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => {
            const now = Date.now();
            const note: ProjectNote = {
              id: newId("note"),
              title,
              body,
              pinned,
              createdAt: now,
              updatedAt: now,
            };
            return {
              ...p,
              notes: [note, ...(p.notes ?? [])],
              events: appendEvent(p, "note_added", title),
            };
          }),
        })),
      updateNote: (projectId, noteId, patch) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => {
            const notes = (p.notes ?? []).map((n) =>
              n.id === noteId
                ? { ...n, ...patch, updatedAt: Date.now() }
                : n
            );
            const updated = notes.find((n) => n.id === noteId);
            const events = updated
              ? appendEvent(p, "note_updated", updated.title)
              : p.events;
            return { ...p, notes, events };
          }),
        })),
      removeNote: (projectId, noteId) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => ({
            ...p,
            notes: (p.notes ?? []).filter((n) => n.id !== noteId),
          })),
        })),
      addLink: (projectId, { title, url, icon }) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => {
            const link: ProjectLink = {
              id: newId("link"),
              title,
              url,
              icon,
            };
            return { ...p, links: [...(p.links ?? []), link] };
          }),
        })),
      removeLink: (projectId, linkId) =>
        set((s) => ({
          projects: mutateProject(s.projects, projectId, (p) => ({
            ...p,
            links: (p.links ?? []).filter((l) => l.id !== linkId),
          })),
        })),
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
