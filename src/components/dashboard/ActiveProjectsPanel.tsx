import { Card, CardHeader } from "../ui/Card";
import { ProgressRing } from "../ui/ProgressRing";
import {
  ACTIVE_PROJECTS,
  projectColorClasses,
  type Project,
} from "../../data/projects";
import { formatHM } from "../../utils/time";

function ProjectRow({ project }: { project: Project }) {
  const colors = projectColorClasses(project.color);
  const Icon = project.icon;
  const progress = project.weeklyMinutes / project.weeklyGoalMinutes;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}
      >
        <Icon size={18} className={colors.iconColor} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-text-primary truncate">
          {project.name}
        </div>
        <div className="text-xs text-text-secondary truncate">
          {project.category}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-text-primary tabular-nums leading-tight">
          {formatHM(project.weeklyMinutes)}
        </div>
        <div className="text-[11px] text-text-muted leading-tight mt-0.5">
          This Week
        </div>
      </div>

      <ProgressRing
        progress={progress}
        size={36}
        stroke={3}
        color={colors.ringStroke}
        ariaLabel={`${Math.round(progress * 100)}% of weekly goal`}
      />
    </li>
  );
}

export function ActiveProjectsPanel() {
  return (
    <Card>
      <CardHeader
        title="Active Projects"
        trailing={
          <button
            type="button"
            className="text-xs font-medium text-brand-purple hover:text-brand-purple/80 transition-colors"
          >
            Manage
          </button>
        }
      />
      <ul className="mt-2 flex flex-col divide-y divide-border-subtle/50">
        {ACTIVE_PROJECTS.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </ul>
    </Card>
  );
}
