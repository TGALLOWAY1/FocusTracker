import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TodayPage } from "./TodayPage";
import { BottomBar } from "./BottomBar";
import { InsightsPage } from "../insights/InsightsPage";
import { LearningPathPage } from "../learning/LearningPathPage";

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <div
        className="
          flex-1 min-h-0
          grid gap-0
          grid-cols-1
          lg:grid-cols-[240px_minmax(0,1fr)_400px]
          xl:grid-cols-[240px_minmax(0,1fr)_460px]
        "
      >
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/learning" element={<LearningPathPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </div>
      <BottomBar />
    </div>
  );
}
