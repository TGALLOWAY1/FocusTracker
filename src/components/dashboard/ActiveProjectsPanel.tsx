import { Card, CardHeader } from "../ui/Card";
import { ProgressRing } from "../ui/ProgressRing";
import {
  PROJECT_ICONS,
  projectColorClasses,
  type Project,
} from "../../data/projects";
import { useProjectStore } from "../../state/projectStore";
import { useFocusStore } from "../../state/focusStore";
import { formatHM } from "../../utils/time";

const FOCUS_SESSION_CARD_ID = "focus-session-card";

function selectProject(name: string, setProject: (n: string) => void) {
  setProject(name);
  const target = document.getElementById(FOCUS_SESSION_CARD_ID);
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function ProjectRow({ project }: { project: Project }) {
  const colors = projectColorClasses(project.color);
  const Icon = PROJECT_ICONS[project.iconKey];
  const progress = project.weeklyMinutes / project.weeklyGoalMinutes;
  const setProject = useFocusStore((s) => s.setProject);

  return (
    <li>
      <button
        type="button"
        onClick={() => selectProject(project.name, setProject)}
        aria-label={`Start a focus session for ${project.name}`}
        className="w-full flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-xl text-left hover:bg-bg-cardHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 transition-colors"
      >
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
      </button>
    </li>
  );
}

export function ActiveProjectsPanel() {
  const projects = useProjectStore((s) => s.projects);
  return (
    <Card>
      <CardHeader title="Active Projects" />
      <ul className="mt-2 flex flex-col divide-y divide-border-subtle/50">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </ul>
    </Card>
  );
}
