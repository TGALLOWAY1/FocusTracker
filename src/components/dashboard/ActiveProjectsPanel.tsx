import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { ProgressRing } from "../ui/ProgressRing";
import {
  PROJECT_ICONS,
  projectColorClasses,
  type Project,
} from "../../data/projects";
import { useProjectStore } from "../../state/projectStore";
import { useFocusStore } from "../../state/focusStore";
import { useAllProjectStats } from "../../state/useProjectStats";
import { formatHM } from "../../utils/time";

const FOCUS_SESSION_CARD_ID = "focus-session-card";
const VISIBLE_LIMIT = 5;

function selectProject(
  project: Project,
  setActiveProject: (p: { id: string; name: string }) => void
) {
  setActiveProject({ id: project.id, name: project.name });
  const target = document.getElementById(FOCUS_SESSION_CARD_ID);
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function ProjectRow({ project }: { project: Project }) {
  const colors = projectColorClasses(project.color);
  const Icon = PROJECT_ICONS[project.iconKey];
  const progress = project.weeklyMinutes / project.weeklyGoalMinutes;
  const setActiveProject = useFocusStore((s) => s.setActiveProject);

  return (
    <li>
      <button
        type="button"
        onClick={() => selectProject(project, setActiveProject)}
        aria-label={`Start a focus session for ${project.name}`}
        className="w-full flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-xl text-left hover:bg-bg-cardHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 transition-colors"
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.iconBg}`}
        >
          <Icon size={16} className={colors.iconColor} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text-primary truncate">
            {project.name}
          </div>
          <div className="text-xs text-text-secondary truncate">
            {project.category}
          </div>
        </div>

        <div className="text-sm font-semibold text-text-primary tabular-nums shrink-0">
          {formatHM(project.weeklyMinutes)}
        </div>

        <ProgressRing
          progress={progress}
          size={28}
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
  const stats = useAllProjectStats();

  const active = projects
    .filter((p) => p.status === "active")
    .slice()
    .sort((a, b) => {
      const aAt = stats.get(a.id)?.lastActivityAt ?? 0;
      const bAt = stats.get(b.id)?.lastActivityAt ?? 0;
      return bAt - aAt;
    });

  const visible = active.slice(0, VISIBLE_LIMIT);
  const hiddenCount = active.length - visible.length;

  return (
    <Card>
      <CardHeader
        title="Active Projects"
        trailing={
          active.length > 0 ? (
            <Eyebrow as="span">{active.length} active</Eyebrow>
          ) : undefined
        }
      />
      {visible.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border-subtle bg-bg-elevated/40 p-4 text-center text-sm text-text-secondary">
          No active projects.{" "}
          <Link
            to="/projects"
            className="text-brand-purple hover:text-brand-purpleDeep font-medium"
          >
            Start one
          </Link>
          .
        </div>
      ) : (
        <>
          <ul className="mt-2 flex flex-col divide-y divide-border-subtle/50">
            {visible.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </ul>
          {hiddenCount > 0 && (
            <Link
              to="/projects"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              View all {active.length} active projects
              <ArrowUpRight size={12} />
            </Link>
          )}
        </>
      )}
    </Card>
  );
}
