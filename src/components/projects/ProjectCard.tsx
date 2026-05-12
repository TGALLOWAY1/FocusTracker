import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil, Trash2, Clock3, Tag } from "lucide-react";
import {
  PROJECT_ICONS,
  coverBackground,
  projectColorClasses,
  type Project,
  PROJECT_STATUS_LABEL,
} from "../../data/projects";
import { ProgressRing } from "../ui/ProgressRing";
import { formatHM } from "../../utils/time";
import { useProjectStore } from "../../state/projectStore";
import type { ProjectStats } from "../../state/useProjectStats";

type Props = {
  project: Project;
  stats: ProjectStats | undefined;
  onEdit: () => void;
  onLogTime: () => void;
};

const STATUS_DOT: Record<Project["status"], string> = {
  active: "bg-accent-green",
  "on-hold": "bg-accent-yellow",
  completed: "bg-brand-purple",
  archived: "bg-text-muted",
};

function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle">
      {label}
    </span>
  );
}

export function ProjectCard({ project, stats, onEdit, onLogTime }: Props) {
  const colors = projectColorClasses(project.color);
  const Icon = PROJECT_ICONS[project.iconKey];
  const totalMinutes = stats?.totalMinutes ?? 0;
  const removeProject = useProjectStore((s) => s.removeProject);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (
      window.confirm(`Delete "${project.name}"? This cannot be undone.`)
    ) {
      removeProject(project.id);
    }
  };

  const navigateToDetail = () => navigate(`/projects/${project.id}`);
  const handleCardKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToDetail();
    }
  };
  const stop = (e: MouseEvent) => e.stopPropagation();

  const visibleTags = project.tags.slice(0, 3);
  const extraTags = project.tags.length - visibleTags.length;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={navigateToDetail}
      onKeyDown={handleCardKey}
      aria-label={`Open ${project.name}`}
      className="bg-bg-card border border-border-subtle rounded-2xl shadow-card overflow-hidden flex flex-col cursor-pointer transition-colors hover:bg-bg-cardHover hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
    >
      <div className="relative h-36" style={{ background: coverBackground(project.cover) }}>
        <div
          className={`absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md bg-black/30 border border-white/10`}
        >
          <Icon size={18} className={colors.iconColor} strokeWidth={2} />
        </div>
        <div className="absolute top-3 right-3" ref={menuRef} onClick={stop}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="Project actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md bg-black/30 border border-white/10 text-white/80 hover:text-white transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-44 bg-bg-card border border-border-subtle rounded-xl shadow-xl shadow-black/40 py-1 z-10"
            >
              <button
                role="menuitem"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
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
                onClick={(e) => {
                  e.stopPropagation();
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
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider bg-black/40 text-white/90 backdrop-blur-md border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status]}`} aria-hidden="true" />
          {PROJECT_STATUS_LABEL[project.status]}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {project.name}
          </h3>
          <p className="mt-1 text-xs text-text-secondary line-clamp-2 min-h-[2.25rem]">
            {project.description || project.category}
          </p>
        </div>

        {project.tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleTags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
            {extraTags > 0 && (
              <span className="text-[11px] text-text-muted">+{extraTags}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Tag size={12} /> No tags
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <ProgressRing
              progress={project.progressPercent / 100}
              size={36}
              stroke={3}
              color={colors.ringStroke}
              ariaLabel={`${project.progressPercent}% complete`}
            >
              <span className="text-[10px] font-semibold text-text-primary tabular-nums">
                {project.progressPercent}%
              </span>
            </ProgressRing>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-text-primary tabular-nums leading-tight">
              {totalMinutes === 0 ? "0h" : formatHM(totalMinutes)}
            </div>
            <div className="text-[11px] text-text-muted leading-tight">
              Focus Time
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
