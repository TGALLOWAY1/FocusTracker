import { FocusLadderPanel } from "../dashboard/FocusLadderPanel";
import { FocusStatsPanel } from "../dashboard/FocusStatsPanel";
import { ActiveProjectsPanel } from "../dashboard/ActiveProjectsPanel";
import { useWeeklyStats } from "../../state/useWeeklyStats";
import { useUIStore } from "../../state/uiStore";
import { PanelRightClose } from "lucide-react";

export function RightPanel() {
  const weeklyStats = useWeeklyStats();
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);

  return (
    <aside className="relative hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
      <button
        onClick={toggleRightSidebar}
        className="absolute top-4 right-4 z-10 p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
        title="Collapse side panel"
      >
        <PanelRightClose size={16} />
      </button>
      <FocusLadderPanel />
      <FocusStatsPanel data={weeklyStats} />
      <ActiveProjectsPanel />
    </aside>
  );
}
