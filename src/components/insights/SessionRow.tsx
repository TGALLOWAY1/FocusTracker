import { CheckCircle2, AlertCircle, Star, Zap, Target } from "lucide-react";
import { useProjectStore } from "../../state/projectStore";
import { PROJECT_ICONS, projectColorClasses } from "../../data/projects";
import { ACTIVITY_CATEGORIES } from "../../data/activityCategories";
import { formatHM } from "../../utils/time";
import type { LoggedSession } from "../../state/focusStore";

function formatTimeOfDay(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function FocusRatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Focus rating ${rating} of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rating;
        return (
          <Star
            key={n}
            size={12}
            strokeWidth={2}
            className={
              filled
                ? "fill-accent-yellow text-accent-yellow"
                : "text-border-strong"
            }
          />
        );
      })}
    </div>
  );
}

function EnergyRatingDots({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Energy rating ${rating} of 5`}
    >
      <Zap size={11} strokeWidth={2.5} className="text-accent-orange mr-0.5" />
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rating;
        return (
          <span
            key={n}
            className={`block w-1.5 h-1.5 rounded-full ${
              filled ? "bg-accent-orange" : "bg-border-strong"
            }`}
          />
        );
      })}
    </div>
  );
}

function TagChip({ label, tone }: { label: string; tone: "category" | "neutral" | "highlight" }) {
  const classes = {
    category: "",
    neutral: "bg-bg-elevated text-text-secondary",
    highlight: "bg-brand-purpleSoft text-brand-purple",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ${classes[tone]}`}
    >
      {label}
    </span>
  );
}

export function SessionRow({ entry }: { entry: LoggedSession }) {
  const { session, reflection } = entry;
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === session.projectId);

  const colors = project
    ? projectColorClasses(project.color)
    : projectColorClasses("purple");
  const Icon = project ? PROJECT_ICONS[project.iconKey] : PROJECT_ICONS.code;
  const categoryMeta = ACTIVITY_CATEGORIES[session.activityCategory];

  const durationMin = Math.max(1, Math.round(session.actualDurationSec / 60));
  const completed = session.completedNaturally;

  return (
    <article className="flex items-start gap-3 p-4 rounded-2xl border border-border-subtle bg-bg-card hover:bg-bg-cardHover transition-colors">
      <div
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${colors.iconBg}`}
      >
        <Icon size={18} className={colors.iconColor} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">
              {session.projectName}
            </div>
            {session.task && (
              <div className="text-xs text-text-secondary truncate">
                {session.task}
              </div>
            )}
          </div>

          <div className="text-right shrink-0 leading-tight">
            <div className="text-sm font-semibold tabular-nums text-text-primary">
              {formatHM(durationMin)}
            </div>
            <div className="text-[11px] text-text-muted tabular-nums">
              {formatTimeOfDay(session.startedAt)}–
              {formatTimeOfDay(session.endedAt)}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center flex-wrap gap-2">
          <span
            className={[
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium",
              completed
                ? "bg-accent-greenSoft text-accent-green"
                : "bg-accent-orangeSoft text-accent-orange",
            ].join(" ")}
          >
            {completed ? (
              <CheckCircle2 size={12} strokeWidth={2.5} />
            ) : (
              <AlertCircle size={12} strokeWidth={2.5} />
            )}
            {completed ? "Completed" : "Ended early"}
          </span>

          {reflection && reflection.focusLevel > 0 && (
            <FocusRatingStars rating={reflection.focusLevel} />
          )}

          {reflection && reflection.energyLevel > 0 && (
            <EnergyRatingDots rating={reflection.energyLevel} />
          )}

          {reflection?.completedPlanned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-brand-purpleSoft text-brand-purple">
              <Target size={10} strokeWidth={2.5} />
              On plan
            </span>
          )}

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${categoryMeta.bgClass} ${categoryMeta.textClass}`}
          >
            {categoryMeta.label}
          </span>

          {session.tags
            .filter((t) => t !== categoryMeta.label && t !== "Completed")
            .map((tag) => (
              <TagChip key={tag} label={tag} tone="neutral" />
            ))}
        </div>

        {reflection?.reflection && (
          <p className="mt-2.5 text-xs text-text-secondary italic leading-relaxed line-clamp-2">
            “{reflection.reflection}”
          </p>
        )}
      </div>
    </article>
  );
}
