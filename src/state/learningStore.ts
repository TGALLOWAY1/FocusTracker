import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MACHINE_LEARNING_PATH,
  type LearningNote,
  type LearningPath,
  type LearningSubtopic,
} from "../data/learningPath";

export type RightTab = "notes" | "resources" | "tasks";
export type ViewMode = "roadmap" | "list";

type LearningState = {
  path: LearningPath;
  expandedModuleIds: string[];
  selectedSubtopicId: string;
  notesSubtopicId: string;
  activeRightTab: RightTab;
  viewMode: ViewMode;
  overviewVisible: boolean;
};

type LearningActions = {
  toggleModule: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectSubtopic: (id: string) => void;
  setNotesSubtopic: (id: string) => void;
  setActiveTab: (tab: RightTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setOverviewVisible: (visible: boolean) => void;
  toggleOverview: () => void;
  appendUserParagraph: (subtopicId: string, text: string) => void;
  updateUserParagraph: (
    subtopicId: string,
    index: number,
    text: string
  ) => void;
  removeUserParagraph: (subtopicId: string, index: number) => void;
  updateNote: (subtopicId: string, partial: Partial<LearningNote>) => void;
  initializeNote: (subtopicId: string) => void;
};

export type LearningStore = LearningState & LearningActions;

type NoteUpdater = (note: LearningNote | undefined) => LearningNote | undefined;

function mapSubtopicsForNote(
  list: LearningSubtopic[],
  targetId: string,
  update: NoteUpdater
): { changed: boolean; list: LearningSubtopic[] } {
  let changed = false;
  const next = list.map((item) => {
    if (item.id === targetId) {
      const nextNote = update(item.note);
      if (nextNote !== item.note) {
        changed = true;
        return { ...item, note: nextNote };
      }
      return item;
    }
    if (item.children) {
      const nested = mapSubtopicsForNote(item.children, targetId, update);
      if (nested.changed) {
        changed = true;
        return { ...item, children: nested.list };
      }
    }
    return item;
  });
  return { changed, list: next };
}

export function updateNoteInPath(
  path: LearningPath,
  subtopicId: string,
  update: NoteUpdater
): LearningPath {
  let pathChanged = false;
  const modules = path.modules.map((module) => {
    const result = mapSubtopicsForNote(module.subtopics, subtopicId, update);
    if (!result.changed) return module;
    pathChanged = true;
    return { ...module, subtopics: result.list };
  });
  return pathChanged ? { ...path, modules } : path;
}

function emptyNote(subtopicId: string): LearningNote {
  return {
    subtopicId,
    heading: "",
    intro: "",
    bullets: [],
    insight: "",
    code: { language: "Python", source: "" },
    userParagraphs: [],
  };
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set) => ({
      path: MACHINE_LEARNING_PATH,
      expandedModuleIds: ["core-concepts"],
      selectedSubtopicId: "2.6",
      notesSubtopicId: "2.6.3",
      activeRightTab: "notes",
      viewMode: "list",
      overviewVisible: true,

      toggleModule: (id) =>
        set((s) => ({
          expandedModuleIds: s.expandedModuleIds.includes(id)
            ? s.expandedModuleIds.filter((x) => x !== id)
            : [...s.expandedModuleIds, id],
        })),

      expandAll: () =>
        set((s) => ({
          expandedModuleIds: s.path.modules.map((m) => m.id),
        })),

      collapseAll: () => set({ expandedModuleIds: [] }),

      selectSubtopic: (id) =>
        set({ selectedSubtopicId: id, notesSubtopicId: id }),

      setNotesSubtopic: (id) => set({ notesSubtopicId: id }),
      setActiveTab: (tab) => set({ activeRightTab: tab }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setOverviewVisible: (visible) => set({ overviewVisible: visible }),
      toggleOverview: () =>
        set((s) => ({ overviewVisible: !s.overviewVisible })),

      appendUserParagraph: (subtopicId, text) =>
        set((s) => {
          const trimmed = text.trim();
          if (!trimmed) return s;
          return {
            path: updateNoteInPath(s.path, subtopicId, (note) => {
              const base = note ?? emptyNote(subtopicId);
              return {
                ...base,
                userParagraphs: [...base.userParagraphs, trimmed],
              };
            }),
          };
        }),

      updateUserParagraph: (subtopicId, index, text) =>
        set((s) => ({
          path: updateNoteInPath(s.path, subtopicId, (note) => {
            if (!note) return note;
            if (index < 0 || index >= note.userParagraphs.length) return note;
            const next = note.userParagraphs.slice();
            next[index] = text;
            return { ...note, userParagraphs: next };
          }),
        })),

      removeUserParagraph: (subtopicId, index) =>
        set((s) => ({
          path: updateNoteInPath(s.path, subtopicId, (note) => {
            if (!note) return note;
            if (index < 0 || index >= note.userParagraphs.length) return note;
            const next = note.userParagraphs.slice();
            next.splice(index, 1);
            return { ...note, userParagraphs: next };
          }),
        })),

      updateNote: (subtopicId, partial) =>
        set((s) => ({
          path: updateNoteInPath(s.path, subtopicId, (note) =>
            note ? { ...note, ...partial } : note
          ),
        })),

      initializeNote: (subtopicId) =>
        set((s) => ({
          path: updateNoteInPath(s.path, subtopicId, (note) =>
            note ?? emptyNote(subtopicId)
          ),
        })),
    }),
    {
      name: "focus-ladder.learning",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
