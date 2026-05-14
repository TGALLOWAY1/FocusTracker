import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UIState = {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
};

type UIActions = {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      toggleLeftSidebar: () =>
        set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      toggleRightSidebar: () =>
        set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
      setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
      setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
    }),
    {
      name: "focus-ladder.ui",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
