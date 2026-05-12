export type DetailTab =
  | "overview"
  | "tasks"
  | "resources"
  | "notes"
  | "sessions"
  | "activity";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "resources", label: "Resources" },
  { key: "notes", label: "Notes" },
  { key: "sessions", label: "Focus Sessions" },
  { key: "activity", label: "Activity" },
];

type Props = {
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
};

export function ProjectTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Project sections"
      className="flex items-center gap-1 min-w-0 overflow-x-auto border-b border-border-subtle"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative px-3 h-10 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              isActive
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-brand-purple rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
