import { Card, CardHeader } from "../../ui/Card";
import { ProgressRing } from "../../ui/ProgressRing";
import {
  PROJECT_STATUS_LABEL,
  projectColorClasses,
  type Project,
} from "../../../data/projects";
import { formatHM } from "../../../utils/time";
import type { ProjectStats } from "../../../state/useProjectStats";

type Props = {
  project: Project;
  stats: ProjectStats;
};

const STATUS_DOT: Record<Project["status"], string> = {
  active: "bg-accent-green",
  "on-hold": "bg-accent-yellow",
  completed: "bg-brand-purple",
  archived: "bg-text-muted",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectOverviewCard({ project, stats }: Props) {
  const colors = projectColorClasses(project.color);
  return (
    <Card>
      <CardHeader
        title="Project Overview"
        subtitle={
          project.description
            ? undefined
            : project.category || "Project summary"
        }
      />
      {project.description && (
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          {project.description}
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Metric label="Status">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary">
            <span
              className={`w-2 h-2 rounded-full ${STATUS_DOT[project.status]}`}
              aria-hidden="true"
            />
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </Metric>
        <Metric label="Progress">
          <div className="flex items-center gap-2">
            <ProgressRing
              progress={project.progressPercent / 100}
              size={36}
              stroke={4}
              color={colors.ringStroke}
              ariaLabel={`${project.progressPercent}% complete`}
            >
              <span className="text-[10px] font-semibold text-text-primary tabular-nums">
                {project.progressPercent}%
              </span>
            </ProgressRing>
          </div>
        </Metric>
        <Metric label="Focus Time">
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            {stats.totalMinutes === 0 ? "0h" : formatHM(stats.totalMinutes)}
          </span>
        </Metric>
        <Metric label="Created">
          <span className="text-sm font-medium text-text-primary">
            {formatDate(project.createdAt)}
          </span>
        </Metric>
        <Metric label="Last Updated">
          <span className="text-sm font-medium text-text-primary">
            {formatDate(project.updatedAt)}
          </span>
        </Metric>
      </div>
    </Card>
  );
}

function Metric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
