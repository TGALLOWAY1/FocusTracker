import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MACHINE_LEARNING_PATH,
  type LearningNote,
  type LearningPath,
  type LearningSubtopic,
  type LearningResource,
  type LearningTask,
} from "../data/learningPath";
import { newId } from "../utils/id";

export type RightTab = "notes" | "resources" | "tasks";
export type ViewMode = "roadmap" | "list";

type LearningState = {
  paths: LearningPath[];
  activePathId: string;
  expandedModuleIds: string[];
  selectedSubtopicId: string;
  notesSubtopicId: string;
  activeRightTab: RightTab;
  viewMode: ViewMode;
  overviewVisible: boolean;
  outlineVisible: boolean;
};

type LearningActions = {
  createPath: (title: string, subtitle: string) => void;
  setActivePath: (id: string) => void;
  updatePathSync: (url?: string) => void;
  addModule: (title: string) => void;
  addSubtopic: (moduleId: string, title: string, description?: string) => void;
  addChildSubtopic: (parentId: string, title: string, description?: string) => void;
  addResource: (subtopicId: string, resource: LearningResource) => void;
  addTask: (subtopicId: string, task: LearningTask) => void;
  toggleTask: (subtopicId: string, taskId: string) => void;
  removeTask: (subtopicId: string, taskId: string) => void;
  addNoteAttachment: (subtopicId: string, dataUrl: string, name?: string) => void;

  toggleModule: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectSubtopic: (id: string) => void;
  setNotesSubtopic: (id: string) => void;
  setActiveTab: (tab: RightTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setOverviewVisible: (visible: boolean) => void;
  toggleOverview: () => void;
  toggleOutline: () => void;
  appendUserParagraph: (subtopicId: string, text: string) => void;
  updateUserParagraph: (subtopicId: string, index: number, text: string) => void;
  removeUserParagraph: (subtopicId: string, index: number) => void;
  updateNote: (subtopicId: string, partial: Partial<LearningNote>) => void;
  initializeNote: (subtopicId: string) => void;
};

export type LearningStore = LearningState & LearningActions;

type NoteUpdater = (note: LearningNote | undefined) => LearningNote | undefined;
type SubtopicUpdater = (subtopic: LearningSubtopic) => LearningSubtopic;

function mapSubtopics(
  list: LearningSubtopic[],
  targetId: string,
  update: SubtopicUpdater
): { changed: boolean; list: LearningSubtopic[] } {
  let changed = false;
  const next = list.map((item) => {
    if (item.id === targetId) {
      changed = true;
      return update(item);
    }
    if (item.children) {
      const nested = mapSubtopics(item.children, targetId, update);
      if (nested.changed) {
        changed = true;
        return { ...item, children: nested.list };
      }
    }
    return item;
  });
  return { changed, list: next };
}

export function updateSubtopicInPath(
  path: LearningPath,
  subtopicId: string,
  update: SubtopicUpdater
): LearningPath {
  let pathChanged = false;
  const modules = path.modules.map((module) => {
    const result = mapSubtopics(module.subtopics, subtopicId, update);
    if (!result.changed) return module;
    pathChanged = true;
    return { ...module, subtopics: result.list };
  });
  return pathChanged ? { ...path, modules } : path;
}

export function updateNoteInPath(
  path: LearningPath,
  subtopicId: string,
  update: NoteUpdater
): LearningPath {
  return updateSubtopicInPath(path, subtopicId, (item) => {
    const nextNote = update(item.note);
    if (nextNote !== item.note) {
      return { ...item, note: nextNote };
    }
    return item;
  });
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
    (set, get) => {
      const updateActivePath = (updater: (path: LearningPath) => LearningPath) => {
        set((s) => {
          const activeIndex = s.paths.findIndex((p) => p.id === s.activePathId);
          if (activeIndex === -1) return s;
          const nextPaths = [...s.paths];
          nextPaths[activeIndex] = updater(nextPaths[activeIndex]);
          return { paths: nextPaths };
        });
      };

      return {
        paths: [MACHINE_LEARNING_PATH],
        activePathId: MACHINE_LEARNING_PATH.id,
        expandedModuleIds: ["core-concepts"],
        selectedSubtopicId: "2.6",
        notesSubtopicId: "2.6.3",
        activeRightTab: "notes",
        viewMode: "list",
        overviewVisible: true,
        outlineVisible: true,

        createPath: (title, subtitle) => {
          const newPath: LearningPath = {
            id: newId("path"),
            title,
            subtitle,
            modules: [],
          };
          set((s) => ({
            paths: [...s.paths, newPath],
            activePathId: newPath.id,
            expandedModuleIds: [],
            selectedSubtopicId: "",
            notesSubtopicId: "",
          }));
        },

        setActivePath: (id) => {
          const path = get().paths.find((p) => p.id === id);
          if (!path) return;
          const firstSub = path.modules[0]?.subtopics[0]?.id ?? "";
          set({
            activePathId: id,
            expandedModuleIds: path.modules.length > 0 ? [path.modules[0].id] : [],
            selectedSubtopicId: firstSub,
            notesSubtopicId: firstSub,
          });
        },

        updatePathSync: (url) => {
          updateActivePath((path) => ({
            ...path,
            notionUrl: url !== undefined ? url : path.notionUrl,
            lastSyncedAt: Date.now(),
          }));
        },

        addModule: (title) => {
          updateActivePath((path) => ({
            ...path,
            modules: [
              ...path.modules,
              {
                id: newId("mod"),
                numericLabel: String(path.modules.length + 1),
                title,
                completedCount: 0,
                totalCount: 0,
                subtopics: [],
              },
            ],
          }));
        },

        addSubtopic: (moduleId, title, description) => {
          updateActivePath((path) => {
            const modIndex = path.modules.findIndex((m) => m.id === moduleId);
            if (modIndex === -1) return path;
            const newModules = [...path.modules];
            const mod = newModules[modIndex];
            const numericLabel = `${mod.numericLabel}.${mod.subtopics.length + 1}`;
            newModules[modIndex] = {
              ...mod,
              totalCount: mod.totalCount + 1,
              subtopics: [
                ...mod.subtopics,
                {
                  id: newId("sub"),
                  numericLabel,
                  title,
                  description,
                  status: "not-started",
                  tasks: [],
                  resources: [],
                  children: [],
                },
              ],
            };
            return { ...path, modules: newModules };
          });
        },

        addChildSubtopic: (parentId, title, description) => {
          updateActivePath((path) =>
            updateSubtopicInPath(path, parentId, (parent) => {
              const numericLabel = `${parent.numericLabel}.${(parent.children?.length ?? 0) + 1}`;
              return {
                ...parent,
                children: [
                  ...(parent.children ?? []),
                  {
                    id: newId("sub"),
                    numericLabel,
                    title,
                    description,
                    status: "not-started",
                    tasks: [],
                    resources: [],
                    children: [],
                  },
                ],
              };
            })
          );
        },

        addResource: (subtopicId, resource) => {
          updateActivePath((path) =>
            updateSubtopicInPath(path, subtopicId, (sub) => ({
              ...sub,
              resources: [...(sub.resources ?? []), resource],
            }))
          );
        },

        addTask: (subtopicId, task) => {
          updateActivePath((path) =>
            updateSubtopicInPath(path, subtopicId, (sub) => ({
              ...sub,
              tasks: [...(sub.tasks ?? []), task],
            }))
          );
        },

        toggleTask: (subtopicId, taskId) => {
          updateActivePath((path) =>
            updateSubtopicInPath(path, subtopicId, (sub) => {
              if (!sub.tasks) return sub;
              return {
                ...sub,
                tasks: sub.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
              };
            })
          );
        },

        removeTask: (subtopicId, taskId) => {
          updateActivePath((path) =>
            updateSubtopicInPath(path, subtopicId, (sub) => {
              if (!sub.tasks) return sub;
              return {
                ...sub,
                tasks: sub.tasks.filter((t) => t.id !== taskId),
              };
            })
          );
        },

        addNoteAttachment: (subtopicId, dataUrl, name) => {
          updateActivePath((path) =>
            updateNoteInPath(path, subtopicId, (note) => {
              const base = note ?? emptyNote(subtopicId);
              return {
                ...base,
                attachments: [
                  ...(base.attachments ?? []),
                  { id: newId("att"), dataUrl, name },
                ],
              };
            })
          );
        },

        toggleModule: (id) =>
          set((s) => ({
            expandedModuleIds: s.expandedModuleIds.includes(id)
              ? s.expandedModuleIds.filter((x) => x !== id)
              : [...s.expandedModuleIds, id],
          })),

        expandAll: () =>
          set((s) => {
            const path = s.paths.find((p) => p.id === s.activePathId);
            return {
              expandedModuleIds: path ? path.modules.map((m) => m.id) : [],
            };
          }),

        collapseAll: () => set({ expandedModuleIds: [] }),

        selectSubtopic: (id) =>
          set({ selectedSubtopicId: id, notesSubtopicId: id }),

        setNotesSubtopic: (id) => set({ notesSubtopicId: id }),
        setActiveTab: (tab) => set({ activeRightTab: tab }),
        setViewMode: (mode) => set({ viewMode: mode }),
        setOverviewVisible: (visible) => set({ overviewVisible: visible }),
        toggleOverview: () =>
          set((s) => ({ overviewVisible: !s.overviewVisible })),
        toggleOutline: () =>
          set((s) => ({ outlineVisible: !s.outlineVisible })),

        appendUserParagraph: (subtopicId, text) =>
          updateActivePath((path) => {
            const trimmed = text.trim();
            if (!trimmed) return path;
            return updateNoteInPath(path, subtopicId, (note) => {
              const base = note ?? emptyNote(subtopicId);
              return {
                ...base,
                userParagraphs: [...base.userParagraphs, trimmed],
              };
            });
          }),

        updateUserParagraph: (subtopicId, index, text) =>
          updateActivePath((path) =>
            updateNoteInPath(path, subtopicId, (note) => {
              if (!note) return note;
              if (index < 0 || index >= note.userParagraphs.length) return note;
              const next = note.userParagraphs.slice();
              next[index] = text;
              return { ...note, userParagraphs: next };
            })
          ),

        removeUserParagraph: (subtopicId, index) =>
          updateActivePath((path) =>
            updateNoteInPath(path, subtopicId, (note) => {
              if (!note) return note;
              if (index < 0 || index >= note.userParagraphs.length) return note;
              const next = note.userParagraphs.slice();
              next.splice(index, 1);
              return { ...note, userParagraphs: next };
            })
          ),

        updateNote: (subtopicId, partial) =>
          updateActivePath((path) =>
            updateNoteInPath(path, subtopicId, (note) =>
              note ? { ...note, ...partial } : note
            )
          ),

        initializeNote: (subtopicId) =>
          updateActivePath((path) =>
            updateNoteInPath(path, subtopicId, (note) =>
              note ?? emptyNote(subtopicId)
            )
          ),
      };
    },
    {
      name: "focus-ladder.learning",
      version: 2,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
