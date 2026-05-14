import { Routes, Route, Navigate } from "react-router-dom";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TodayPage } from "./TodayPage";
import { BottomBar } from "./BottomBar";
import { InsightsPage } from "../insights/InsightsPage";
import { LearningPathPage } from "../learning/LearningPathPage";
import { ProjectsPage } from "../projects/ProjectsPage";
import { ProjectDetailPage } from "../projects/detail/ProjectDetailPage";
import { useUIStore } from "../../state/uiStore";

export function AppShell() {
  const leftSidebarOpen = useUIStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);

  const getGridCols = () => {
    if (leftSidebarOpen && rightSidebarOpen) {
      return "lg:grid-cols-[240px_minmax(0,1fr)_400px] xl:grid-cols-[240px_minmax(0,1fr)_460px]";
    }
    if (leftSidebarOpen && !rightSidebarOpen) {
      return "lg:grid-cols-[240px_minmax(0,1fr)]";
    }
    if (!leftSidebarOpen && rightSidebarOpen) {
      return "lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_460px]";
    }
    return "lg:grid-cols-1";
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col relative">
      {!leftSidebarOpen && (
        <button
          onClick={toggleLeftSidebar}
          className="absolute top-4 left-4 z-50 p-2 bg-bg-card border border-border-subtle rounded-md shadow-sm text-text-secondary hover:text-text-primary hover:bg-bg-cardHover transition-colors hidden lg:flex"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}
      {!rightSidebarOpen && (
        <button
          onClick={toggleRightSidebar}
          className="absolute top-4 right-4 z-50 p-2 bg-bg-card border border-border-subtle rounded-md shadow-sm text-text-secondary hover:text-text-primary hover:bg-bg-cardHover transition-colors hidden lg:flex"
          title="Expand side panel"
        >
          <PanelRightOpen size={18} />
        </button>
      )}

      <div
        className={`
          flex-1 min-h-0
          grid gap-0
          grid-cols-1
          relative
          ${getGridCols()}
        `}
      >
        {leftSidebarOpen && <Sidebar />}
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/learning" element={<LearningPathPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </div>
      <BottomBar />
    </div>
  );
}
