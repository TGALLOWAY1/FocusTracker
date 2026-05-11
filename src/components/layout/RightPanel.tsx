import { FocusLadderPanel } from "../dashboard/FocusLadderPanel";
import { FocusStatsPanel } from "../dashboard/FocusStatsPanel";
import { ActiveProjectsPanel } from "../dashboard/ActiveProjectsPanel";

export function RightPanel() {
  return (
    <aside className="hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
      <FocusLadderPanel />
      <FocusStatsPanel />
      <ActiveProjectsPanel />
    </aside>
  );
}
