import { MainContent } from "./MainContent";
import { RightPanel } from "./RightPanel";
import { useUIStore } from "../../state/uiStore";

export function TodayPage() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);

  return (
    <>
      <MainContent />
      {rightSidebarOpen && <RightPanel />}
    </>
  );
}
