import { useMemo } from "react";
import { Card, CardHeader } from "../ui/Card";
import { projectColorClasses, type Project } from "../../data/projects";
import { formatHM } from "../../utils/time";
import type { ProjectStats } from "../../state/useProjectStats";

type Slice = {
  id: string;
  name: string;
  color: string;
  minutes: number;
  percent: number;
};

type Props = {
  projects: Project[];
  stats: Map<string, ProjectStats>;
};

function buildSlices(projects: Project[], stats: Map<string, ProjectStats>): {
  slices: Slice[];
  totalMinutes: number;
} {
  const raw = projects.map((p) => ({
    id: p.id,
    name: p.name,
    color: projectColorClasses(p.color).ringStroke,
    minutes: stats.get(p.id)?.totalMinutes ?? 0,
  }));
  const totalMinutes = raw.reduce((acc, s) => acc + s.minutes, 0);
  const slices: Slice[] = raw
    .filter((s) => s.minutes > 0)
    .map((s) => ({
      ...s,
      percent: totalMinutes === 0 ? 0 : s.minutes / totalMinutes,
    }))
    .sort((a, b) => b.minutes - a.minutes);
  return { slices, totalMinutes };
}

function ProjectDonut({ slices, totalMinutes }: { slices: Slice[]; totalMinutes: number }) {
  const size = 168;
  const thickness = 18;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  let offsetSoFar = 0;
  const hasData = slices.length > 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={
        hasData
          ? slices
              .map((s) => `${s.name}: ${Math.round(s.percent * 100)}%`)
              .join(", ")
          : "No project focus time yet"
      }
      className="w-full h-auto"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#1F2638"
        strokeWidth={thickness}
      />
      {hasData &&
        slices.map((slice) => {
          const length = slice.percent * circumference;
          const dashArray = `${length} ${circumference - length}`;
          const dashOffset = circumference - offsetSoFar;
          offsetSoFar += length;
          return (
            <circle
              key={slice.id}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={18}
        fontWeight={600}
        fill="#F4F6FB"
        className="tabular-nums"
      >
        {totalMinutes === 0 ? "0h" : formatHM(totalMinutes)}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fill="#A3ABBF"
      >
        Total
      </text>
    </svg>
  );
}

export function ProjectFocusDonutPanel({ projects, stats }: Props) {
  const { slices, totalMinutes } = useMemo(
    () => buildSlices(projects, stats),
    [projects, stats]
  );

  const visibleLegend = slices.slice(0, 5);
  const otherMinutes = slices.slice(5).reduce((acc, s) => acc + s.minutes, 0);
  const otherPercent =
    totalMinutes === 0 ? 0 : otherMinutes / totalMinutes;

  return (
    <Card>
      <CardHeader title="Focus Time by Project" subtitle="Where your time lives." />
      <div className="mt-4 flex justify-center">
        <div className="w-[168px]">
          <ProjectDonut slices={slices} totalMinutes={totalMinutes} />
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {slices.length === 0 ? (
          <li className="text-xs text-text-muted text-center py-2">
            Log some focus time and your projects will appear here.
          </li>
        ) : (
          <>
            {visibleLegend.map((slice) => (
              <li
                key={slice.id}
                className="flex items-center gap-2.5 text-xs"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden="true"
                />
                <span className="text-text-primary font-medium flex-1 truncate">
                  {slice.name}
                </span>
                <span className="text-text-secondary tabular-nums">
                  {formatHM(slice.minutes)}
                </span>
                <span className="text-text-muted tabular-nums w-10 text-right">
                  {Math.round(slice.percent * 100)}%
                </span>
              </li>
            ))}
            {otherMinutes > 0 && (
              <li className="flex items-center gap-2.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 bg-text-muted"
                  aria-hidden="true"
                />
                <span className="text-text-primary font-medium flex-1 truncate">
                  Other projects
                </span>
                <span className="text-text-secondary tabular-nums">
                  {formatHM(otherMinutes)}
                </span>
                <span className="text-text-muted tabular-nums w-10 text-right">
                  {Math.round(otherPercent * 100)}%
                </span>
              </li>
            )}
          </>
        )}
      </ul>
    </Card>
  );
}
