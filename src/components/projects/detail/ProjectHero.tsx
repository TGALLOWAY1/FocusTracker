import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreHorizontal,
  Clock3,
  Trash2,
} from "lucide-react";
import {
  PROJECT_ICONS,
  PROJECT_STATUS_LABEL,
  coverBackground,
  projectColorClasses,
  type Project,
} from "../../../data/projects";
import { useProjectStore } from "../../../state/projectStore";

type Props = {
  project: Project;
  onEdit: () => void;
  onLogTime: () => void;
};

const STATUS_DOT: Record<Project["status"], string> = {
  active: "bg-accent-green",
  "on-hold": "bg-accent-yellow",
  completed: "bg-brand-purple",
  archived: "bg-text-muted",
};

export function ProjectHero({ project, onEdit, onLogTime }: Props) {
  const navigate = useNavigate();
  const colors = projectColorClasses(project.color);
  const Icon = PROJECT_ICONS[project.iconKey];
  const removeProject = useProjectStore((s) => s.removeProject);
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

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      removeProject(project.id);
      navigate("/projects");
    }
  };

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-text-primary bg-bg-elevated border border-border-subtle hover:bg-bg-cardHover transition-colors"
          >
            <Pencil size={14} /> Edit Project
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Project actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary bg-bg-elevated border border-border-subtle transition-colors"
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
                  <Trash2 size={14} /> Delete project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-border-subtle"
        style={{ background: coverBackground(project.cover) }}
      >
        <div className="flex items-start gap-5 p-6 sm:p-7">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md bg-black/30 border border-white/10 shrink-0`}
          >
            <Icon size={28} className={colors.iconColor} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-black/40 text-white/90 backdrop-blur-md border border-white/10">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status]}`}
                  aria-hidden="true"
                />
                {PROJECT_STATUS_LABEL[project.status]}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary drop-shadow-sm">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-sm text-text-secondary max-w-2xl">
                {project.description}
              </p>
            )}
            {project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/30 text-white/90 backdrop-blur-md border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
