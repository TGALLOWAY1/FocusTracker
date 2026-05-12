import { Card, CardHeader } from "../ui/Card";
import {
  PROJECT_STATUS_LABEL,
  type Project,
  type ProjectStatus,
} from "../../data/projects";
import type { StatusFilter } from "./ProjectsPage";

type Props = {
  projects: Project[];
  active: StatusFilter;
  onChange: (s: StatusFilter) => void;
};

const PILLS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "on-hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

function countFor(projects: Project[], key: StatusFilter): number {
  if (key === "all") return projects.length;
  return projects.filter((p) => p.status === (key as ProjectStatus)).length;
}

export function ProjectsQuickFiltersPanel({ projects, active, onChange }: Props) {
  return (
    <Card>
      <CardHeader title="Quick Filters" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {PILLS.map((pill) => {
          const isActive = active === pill.key;
          const count = countFor(projects, pill.key);
          const label =
            pill.key === "all" ? pill.label : PROJECT_STATUS_LABEL[pill.key as ProjectStatus];
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => onChange(pill.key)}
              aria-pressed={isActive}
              className={`flex items-center justify-between gap-2 h-10 px-3 rounded-xl border text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-purpleSoft text-text-primary border-brand-purple/25"
                  : "bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary"
              }`}
            >
              <span className="truncate">{label}</span>
              <span className="text-[11px] font-semibold text-text-secondary bg-bg-card rounded-md px-1.5 py-0.5 tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
