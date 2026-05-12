import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MACHINE_LEARNING_PATH,
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
};

type LearningActions = {
  toggleModule: (id: string) => void;
  selectSubtopic: (id: string) => void;
  setNotesSubtopic: (id: string) => void;
  setActiveTab: (tab: RightTab) => void;
  setViewMode: (mode: ViewMode) => void;
  appendUserParagraph: (subtopicId: string, text: string) => void;
};

export type LearningStore = LearningState & LearningActions;

function mapSubtopics(
  list: LearningSubtopic[],
  targetId: string,
  text: string
): { changed: boolean; list: LearningSubtopic[] } {
  let changed = false;
  const next = list.map((item) => {
    if (item.id === targetId && item.note) {
      changed = true;
      return {
        ...item,
        note: {
          ...item.note,
          userParagraphs: [...item.note.userParagraphs, text],
        },
      };
    }
    if (item.children) {
      const nested = mapSubtopics(item.children, targetId, text);
      if (nested.changed) {
        changed = true;
        return { ...item, children: nested.list };
      }
    }
    return item;
  });
  return { changed, list: next };
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

      toggleModule: (id) =>
        set((s) => ({
          expandedModuleIds: s.expandedModuleIds.includes(id)
            ? s.expandedModuleIds.filter((x) => x !== id)
            : [...s.expandedModuleIds, id],
        })),

      selectSubtopic: (id) =>
        set({ selectedSubtopicId: id, notesSubtopicId: id }),

      setNotesSubtopic: (id) => set({ notesSubtopicId: id }),
      setActiveTab: (tab) => set({ activeRightTab: tab }),
      setViewMode: (mode) => set({ viewMode: mode }),

      appendUserParagraph: (subtopicId, text) =>
        set((s) => {
          const trimmed = text.trim();
          if (!trimmed) return s;
          const modules = s.path.modules.map((module) => {
            const result = mapSubtopics(module.subtopics, subtopicId, trimmed);
            return result.changed ? { ...module, subtopics: result.list } : module;
          });
          return { path: { ...s.path, modules } };
        }),
    }),
    {
      name: "focus-ladder.learning",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
