import { useMemo, useState } from "react";
import { Folder, LayoutGrid, List, Plus } from "lucide-react";
import { useProjectStore } from "../../state/projectStore";
import { useAllProjectStats, sortProjects } from "../../state/useProjectStats";
import type { Project, ProjectStatus } from "../../data/projects";
import { formatHM } from "../../utils/time";
import { SummaryStrip, type SummaryItem } from "../ui/SummaryStrip";
import { ProjectsFilterBar } from "./ProjectsFilterBar";
import { ProjectCard } from "./ProjectCard";
import { ProjectListRow } from "./ProjectListRow";
import { ProjectFormModal } from "./ProjectFormModal";
import { LogManualTimeModal } from "./LogManualTimeModal";
import { ProjectFocusDonutPanel } from "./ProjectFocusDonutPanel";
import { ProjectsQuickFiltersPanel } from "./ProjectsQuickFiltersPanel";
import { StayConsistentPanel } from "./StayConsistentPanel";
import { useUIStore } from "../../state/uiStore";
import { PanelRightClose } from "lucide-react";

export type ProjectsSort = "recent" | "name" | "progress" | "focusTime";
export type ProjectsView = "grid" | "list";
export type StatusFilter = ProjectStatus | "all";

function matchesSearch(p: Project, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(needle) ||
    p.description.toLowerCase().includes(needle) ||
    p.category.toLowerCase().includes(needle) ||
    p.tags.some((t) => t.toLowerCase().includes(needle))
  );
}

function Heading({
  view,
  setView,
  sort,
  setSort,
  onNew,
}: {
  view: ProjectsView;
  setView: (v: ProjectsView) => void;
  sort: ProjectsSort;
  setSort: (s: ProjectsSort) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4 min-w-0">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-brand-purpleSoft flex items-center justify-center shrink-0">
          <Folder size={22} className="text-brand-purple" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-text-primary">
            Projects
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            All your projects in one place. Build, learn, create.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div
          role="tablist"
          aria-label="View mode"
          className="flex items-center bg-bg-card border border-border-subtle rounded-xl p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "grid"}
            onClick={() => setView("grid")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              view === "grid"
                ? "bg-brand-purpleSoft text-brand-purple"
                : "text-text-secondary hover:text-text-primary"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              view === "list"
                ? "bg-brand-purpleSoft text-brand-purple"
                : "text-text-secondary hover:text-text-primary"
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>

        <label className="sr-only" htmlFor="projects-sort">
          Sort
        </label>
        <select
          id="projects-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as ProjectsSort)}
          className="bg-bg-card border border-border-subtle text-text-primary text-sm rounded-xl px-3 h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
        >
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="progress">Progress</option>
          <option value="focusTime">Focus Time</option>
        </select>

        <button
          type="button"
          onClick={onNew}
          className="h-10 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-purple/90 transition-colors shadow-[0_8px_24px_-12px_rgba(139,124,246,0.7)]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Project
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="border border-dashed border-border-subtle rounded-2xl bg-bg-card/40 p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-purpleSoft flex items-center justify-center mb-4">
        <Folder size={22} className="text-brand-purple" />
      </div>
      <h2 className="text-base font-semibold text-text-primary">
        No projects match
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Try clearing your filters or start something new.
      </p>
      <button
        type="button"
        onClick={onNew}
        className="mt-4 h-9 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-purple/90 transition-colors"
      >
        <Plus size={14} strokeWidth={2.5} />
        New Project
      </button>
    </div>
  );
}

export function ProjectsPage() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);
  const projects = useProjectStore((s) => s.projects);
  const stats = useAllProjectStats();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProjectsSort>("recent");
  const [view, setView] = useState<ProjectsView>("grid");
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [logTimeFor, setLogTimeFor] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const byStatus =
      statusFilter === "all"
        ? projects
        : projects.filter((p) => p.status === statusFilter);
    const bySearch = byStatus.filter((p) => matchesSearch(p, search));
    return sortProjects(bySearch, stats, sort);
  }, [projects, statusFilter, search, sort, stats]);

  const summaryItems = useMemo<SummaryItem[]>(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const totalMinutes = projects.reduce(
      (acc, p) => acc + (stats.get(p.id)?.totalMinutes ?? 0),
      0
    );
    return [
      { value: String(total), label: total === 1 ? "Project" : "Projects" },
      { value: String(active), label: "Active" },
      { value: totalMinutes === 0 ? "0h" : formatHM(totalMinutes), label: "Focus Time" },
      { value: String(completed), label: "Completed" },
    ];
  }, [projects, stats]);

  return (
    <>
      <main className="flex flex-col gap-4 p-6 min-w-0 overflow-y-auto scrollbar-thin">
        <Heading
          view={view}
          setView={setView}
          sort={sort}
          setSort={setSort}
          onNew={() => setCreating(true)}
        />

        <SummaryStrip
          items={summaryItems}
          ariaLabel="Projects summary"
          className="px-1"
        />

        <ProjectsFilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          projects={projects}
        />

        {filtered.length === 0 ? (
          <EmptyState onNew={() => setCreating(true)} />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                stats={stats.get(p.id)}
                onEdit={() => setEditing(p)}
                onLogTime={() => setLogTimeFor(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-card divide-y divide-border-subtle">
            {filtered.map((p) => (
              <ProjectListRow
                key={p.id}
                project={p}
                stats={stats.get(p.id)}
                onEdit={() => setEditing(p)}
                onLogTime={() => setLogTimeFor(p)}
              />
            ))}
          </div>
        )}
      </main>

      {rightSidebarOpen && (
        <aside className="relative hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
          <button
            onClick={toggleRightSidebar}
            className="absolute top-4 right-4 z-10 p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
            title="Collapse side panel"
          >
            <PanelRightClose size={16} />
          </button>
          <ProjectFocusDonutPanel projects={projects} stats={stats} />
          <ProjectsQuickFiltersPanel
            projects={projects}
            active={statusFilter}
            onChange={setStatusFilter}
          />
          <StayConsistentPanel />
        </aside>
      )}

      {creating && (
        <ProjectFormModal
          key="new"
          open={creating}
          onClose={() => setCreating(false)}
          existing={null}
        />
      )}
      {editing && (
        <ProjectFormModal
          key={editing.id}
          open={!!editing}
          onClose={() => setEditing(null)}
          existing={editing}
        />
      )}
      {logTimeFor && (
        <LogManualTimeModal
          key={logTimeFor.id}
          open={!!logTimeFor}
          onClose={() => setLogTimeFor(null)}
          project={logTimeFor}
        />
      )}
    </>
  );
}
