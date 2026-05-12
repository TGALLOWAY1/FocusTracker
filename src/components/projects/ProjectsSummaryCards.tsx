import { Folder, Activity, Clock, Star } from "lucide-react";
import { Card } from "../ui/Card";
import { formatHM } from "../../utils/time";
import type { Project } from "../../data/projects";
import type { ProjectStats } from "../../state/useProjectStats";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  Icon: typeof Folder;
  iconBg: string;
  iconColor: string;
  valueClass: string;
};

function StatCard({
  label,
  value,
  helper,
  Icon,
  iconBg,
  iconColor,
  valueClass,
}: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
          {label}
        </div>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon size={16} className={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div
        className={`text-[26px] leading-none font-semibold tracking-tight tabular-nums ${valueClass}`}
      >
        {value}
      </div>
      {helper && (
        <div className="text-[11px] text-text-muted leading-tight">{helper}</div>
      )}
    </Card>
  );
}

type Props = {
  projects: Project[];
  stats: Map<string, ProjectStats>;
};

export function ProjectsSummaryCards({ projects, stats }: Props) {
  const total = projects.length;
  const active = projects.filter((p) => p.status === "active").length;
  const archived = projects.filter((p) => p.status === "archived").length;
  const totalMinutes = projects.reduce(
    (acc, p) => acc + (stats.get(p.id)?.totalMinutes ?? 0),
    0
  );
  const currentYear = new Date().getFullYear();
  const completedThisYear = projects.filter(
    (p) =>
      p.status === "completed" &&
      new Date(p.updatedAt).getFullYear() === currentYear
  ).length;

  const activeHelper =
    total === 0
      ? "—"
      : `${Math.round((active / total) * 100)}% of total`;
  const archivedHelper = archived === 1 ? "1 archived" : `${archived} archived`;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard
        label="Total Projects"
        value={String(total)}
        helper={archivedHelper}
        Icon={Folder}
        iconBg="bg-brand-purpleSoft"
        iconColor="text-brand-purple"
        valueClass="text-text-primary"
      />
      <StatCard
        label="Active Projects"
        value={String(active)}
        helper={activeHelper}
        Icon={Activity}
        iconBg="bg-accent-greenSoft"
        iconColor="text-accent-green"
        valueClass="text-text-primary"
      />
      <StatCard
        label="Total Focus Time"
        value={totalMinutes === 0 ? "0h" : formatHM(totalMinutes)}
        helper={totalMinutes === 0 ? "Start a session" : "Across all projects"}
        Icon={Clock}
        iconBg="bg-accent-greenSoft"
        iconColor="text-accent-green"
        valueClass="text-accent-green"
      />
      <StatCard
        label="Completed"
        value={String(completedThisYear)}
        helper="This year"
        Icon={Star}
        iconBg="bg-accent-yellowSoft"
        iconColor="text-accent-yellow"
        valueClass="text-text-primary"
      />
    </div>
  );
}
