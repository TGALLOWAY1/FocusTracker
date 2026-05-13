import { CheckCircle2, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../ui/Card";
import { useProjectStore } from "../../../state/projectStore";
import { useFocusStore } from "../../../state/focusStore";
import { ACTIVITY_CATEGORIES } from "../../../data/activityCategories";
import type { Project } from "../../../data/projects";

type Props = {
  project: Project;
};

export function CurrentFocusCard({ project }: Props) {
  const navigate = useNavigate();
  const toggleTask = useProjectStore((s) => s.toggleTask);
  const setActiveProject = useFocusStore((s) => s.setActiveProject);

  const tasks = project.tasks ?? [];
  const current = tasks.find((t) => !t.completed);
  const remaining = tasks.filter((t) => !t.completed).length;
  const categoryMeta = ACTIVITY_CATEGORIES[project.activityCategory];

  const handleStart = () => {
    setActiveProject({ id: project.id, name: project.name });
    navigate("/today");
  };

  if (!current) {
    return (
      <Card className="flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-wider font-medium text-text-muted">
          Current Focus
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-greenSoft flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-accent-green" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-text-primary">
              All tasks complete
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Add a task to keep momentum, or jump into a free focus session.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="h-10 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-purpleDeep transition-colors shadow-[0_8px_24px_-12px_rgba(139,124,246,0.7)] shrink-0"
          >
            <Play size={14} strokeWidth={2.5} />
            Start Focus Session
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 border-brand-purple/25 bg-gradient-to-br from-brand-purpleSoft/40 via-bg-card to-bg-card">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-wider font-medium text-text-muted inline-flex items-center gap-2">
          <Sparkles size={12} className="text-brand-purple" />
          Current Focus
        </div>
        <span className="text-[11px] text-text-muted tabular-nums">
          {remaining} task{remaining === 1 ? "" : "s"} remaining
        </span>
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary truncate">
            {current.title}
          </h2>
          <div className="mt-2 flex items-center flex-wrap gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${categoryMeta.bgClass} ${categoryMeta.textClass}`}
            >
              {categoryMeta.label}
            </span>
            {current.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle">
                {current.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleStart}
          className="h-10 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-purpleDeep transition-colors shadow-[0_8px_24px_-12px_rgba(139,124,246,0.7)]"
        >
          <Play size={14} strokeWidth={2.5} />
          Start Focus Session
        </button>
        <button
          type="button"
          onClick={() => toggleTask(project.id, current.id)}
          className="h-10 px-4 rounded-xl bg-bg-elevated border border-border-subtle text-sm font-medium text-text-secondary inline-flex items-center gap-2 hover:text-text-primary hover:border-accent-green/40 transition-colors"
        >
          <CheckCircle2 size={14} strokeWidth={2.2} />
          Mark Complete
        </button>
      </div>
    </Card>
  );
}
