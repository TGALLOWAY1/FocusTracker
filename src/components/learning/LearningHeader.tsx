import { List, Map, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import type { ViewMode } from "../../state/learningStore";

type Props = {
  title: string;
  subtitle: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  overviewVisible: boolean;
  onToggleOverview: () => void;
};

function ActivePathPill() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-greenSoft text-accent-green text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
      Active Path
    </span>
  );
}

function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors";
  const active = "bg-bg-card text-text-primary shadow-card";
  const idle = "text-text-secondary hover:text-text-primary";
  return (
    <div className="inline-flex bg-bg-elevated rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => onChange("roadmap")}
        className={`${base} ${viewMode === "roadmap" ? active : idle}`}
      >
        <Map size={14} />
        Roadmap
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`${base} ${viewMode === "list" ? active : idle}`}
      >
        <List size={14} />
        List
      </button>
    </div>
  );
}

export function LearningHeader({
  title,
  subtitle,
  viewMode,
  onViewModeChange,
  overviewVisible,
  onToggleOverview,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap p-6 pb-4 border-b border-border-subtle">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-brand-purpleSoft flex items-center justify-center shrink-0">
          <Map size={22} className="text-brand-purple" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
            <ActivePathPill />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        <button
          type="button"
          onClick={onToggleOverview}
          aria-pressed={!overviewVisible}
          title={overviewVisible ? "Hide overview" : "Show overview"}
          className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          {overviewVisible ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={16} />
          )}
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary cursor-not-allowed opacity-80"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
