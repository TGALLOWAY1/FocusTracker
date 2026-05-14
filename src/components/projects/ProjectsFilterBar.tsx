import { Search, SlidersHorizontal } from "lucide-react";
import type { Project } from "../../data/projects";
import type { StatusFilter } from "./ProjectsPage";

const TABS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "on-hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

type Props = {
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
  search: string;
  setSearch: (q: string) => void;
  projects: Project[];
};

export function ProjectsFilterBar({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="tablist"
        aria-label="Project status"
        className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-none"
      >
        {TABS.map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setStatusFilter(tab.key)}
              className={`relative px-3 h-9 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                active
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-brand-purple rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search projects</span>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="h-10 w-[220px] sm:w-[260px] bg-bg-card border border-border-subtle rounded-xl pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
          />
        </label>
        <button
          type="button"
          aria-label="More filters"
          className="w-10 h-10 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
