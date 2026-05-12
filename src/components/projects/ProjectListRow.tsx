import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Clock3 } from "lucide-react";
import {
  PROJECT_ICONS,
  projectColorClasses,
  PROJECT_STATUS_LABEL,
  type Project,
} from "../../data/projects";
import { ProgressRing } from "../ui/ProgressRing";
import { formatHM } from "../../utils/time";
import { useProjectStore } from "../../state/projectStore";
import type { ProjectStats } from "../../state/useProjectStats";

const STATUS_DOT: Record<Project["status"], string> = {
  active: "bg-accent-green",
  "on-hold": "bg-accent-yellow",
  completed: "bg-brand-purple",
  archived: "bg-text-muted",
};

type Props = {
  project: Project;
  stats: ProjectStats | undefined;
  onEdit: () => void;
  onLogTime: () => void;
};

export function ProjectListRow({ project, stats, onEdit, onLogTime }: Props) {
  const colors = projectColorClasses(project.color);
  const Icon = PROJECT_ICONS[project.iconKey];
  const totalMinutes = stats?.totalMinutes ?? 0;
  const removeProject = useProjectStore((s) => s.removeProject);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`Delete "${project.name}"?`)) {
      removeProject(project.id);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-bg-cardHover transition-colors">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg} shrink-0`}
      >
        <Icon size={18} className={colors.iconColor} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-text-primary truncate">
            {project.name}
          </span>
          <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider text-text-secondary border border-border-subtle shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status]}`}
              aria-hidden="true"
            />
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>
        <p className="text-xs text-text-secondary truncate">
          {project.description || project.category}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-1.5 max-w-[180px] overflow-hidden">
        {project.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle"
          >
            {t}
          </span>
        ))}
      </div>

      <ProgressRing
        progress={project.progressPercent / 100}
        size={32}
        stroke={3}
        color={colors.ringStroke}
        ariaLabel={`${project.progressPercent}% complete`}
      />

      <div className="text-right shrink-0 w-20">
        <div className="text-sm font-semibold text-text-primary tabular-nums leading-tight">
          {totalMinutes === 0 ? "0h" : formatHM(totalMinutes)}
        </div>
        <div className="text-[11px] text-text-muted leading-tight">Focus</div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Project actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-1 w-40 bg-bg-card border border-border-subtle rounded-xl shadow-xl shadow-black/40 py-1 z-10"
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-cardHover"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogTime();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-cardHover"
            >
              <Clock3 size={14} /> Log time
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-bg-cardHover"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
