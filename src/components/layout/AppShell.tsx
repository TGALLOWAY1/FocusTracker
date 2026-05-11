import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { RightPanel } from "./RightPanel";
import { BottomBar } from "./BottomBar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <div
        className="
          flex-1 min-h-0
          grid gap-0
          grid-cols-1
          lg:grid-cols-[240px_minmax(0,1fr)_320px]
          xl:grid-cols-[240px_minmax(0,1fr)_360px]
        "
      >
        <Sidebar />
        <MainContent />
        <RightPanel />
      </div>
      <BottomBar />
    </div>
  );
}
