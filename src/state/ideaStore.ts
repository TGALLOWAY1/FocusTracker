import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { newId } from "../utils/id";

export const IDEA_STATUSES = ["Future Idea", "Maybe Later", "Incubating"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export type Idea = {
  id: string;
  text: string;
  status: IdeaStatus;
  createdAt: number;
};

const HOUR = 1000 * 60 * 60;

const NOW = Date.now();
const SEED: Idea[] = [
  {
    id: "seed-1",
    text: "Build AI tool for drum sampling",
    status: "Future Idea",
    createdAt: NOW - 2 * HOUR,
  },
  {
    id: "seed-2",
    text: "Learn Rust programming",
    status: "Maybe Later",
    createdAt: NOW - 26 * HOUR,
  },
  {
    id: "seed-3",
    text: "Start podcast about music production",
    status: "Incubating",
    createdAt: NOW - 50 * HOUR,
  },
];

type IdeaStore = {
  ideas: Idea[];
  addIdea: (text: string, status: IdeaStatus) => void;
  removeIdea: (id: string) => void;
};

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set) => ({
      ideas: SEED,
      addIdea: (text, status) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          ideas: [
            { id: newId("idea"), text: trimmed, status, createdAt: Date.now() },
            ...s.ideas,
          ],
        }));
      },
      removeIdea: (id) =>
        set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),
    }),
    {
      name: "focus-ladder.ideas",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ideas: state.ideas }),
    }
  )
);
