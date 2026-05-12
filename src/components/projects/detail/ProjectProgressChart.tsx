import { useMemo } from "react";
import { Card, CardHeader } from "../../ui/Card";
import { useFocusStore } from "../../../state/focusStore";
import type { Project } from "../../../data/projects";

type Props = {
  project: Project;
};

const WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

type Point = {
  weekStart: number;
  cumulativeMinutes: number;
  label: string;
};

function startOfWeek(ms: number): number {
  const d = new Date(ms);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function bucketByWeek(
  sessions: { endedAt: number; minutes: number }[],
  manuals: { addedAt: number; minutes: number }[],
  totalTargetMinutes: number
): Point[] {
  const thisWeekStart = startOfWeek(Date.now());
  const firstWeekStart = thisWeekStart - (WEEKS - 1) * WEEK_MS;

  const weeklyMinutes = new Array(WEEKS).fill(0) as number[];

  const addToBucket = (at: number, minutes: number) => {
    if (at < firstWeekStart) {
      weeklyMinutes[0] += minutes;
      return;
    }
    const idx = Math.floor((startOfWeek(at) - firstWeekStart) / WEEK_MS);
    if (idx >= 0 && idx < WEEKS) weeklyMinutes[idx] += minutes;
  };

  for (const s of sessions) addToBucket(s.endedAt, s.minutes);
  for (const m of manuals) addToBucket(m.addedAt, m.minutes);

  const totalLogged = weeklyMinutes.reduce((sum, v) => sum + v, 0);
  // Distribute any unaccounted target minutes evenly across earlier weeks so the
  // curve still tells a meaningful "progress over time" story for seed data.
  const orphan = Math.max(0, totalTargetMinutes - totalLogged);
  if (orphan > 0) {
    const perWeek = orphan / WEEKS;
    for (let i = 0; i < WEEKS; i += 1) weeklyMinutes[i] += perWeek;
  }

  let cumulative = 0;
  return weeklyMinutes.map((m, i) => {
    cumulative += m;
    const weekStart = firstWeekStart + i * WEEK_MS;
    return {
      weekStart,
      cumulativeMinutes: cumulative,
      label: new Date(weekStart).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  });
}

export function ProjectProgressChart({ project }: Props) {
  const sessionLog = useFocusStore((s) => s.sessionLog);
  const points = useMemo(() => {
    const sessions = sessionLog
      .filter((e) => e.session.projectId === project.id)
      .map((e) => ({
        endedAt: e.session.endedAt,
        minutes: e.session.actualDurationSec / 60,
      }));
    const manuals = (project.manualEntries ?? []).map((m) => ({
      addedAt: m.addedAt,
      minutes: m.minutes,
    }));
    // Use the project's target progress (progressPercent of goal) so even
    // seed-only projects produce a visible curve.
    const totalTarget = Math.round(
      ((project.weeklyGoalMinutes ?? 600) * WEEKS * project.progressPercent) /
        100
    );
    return bucketByWeek(sessions, manuals, totalTarget);
  }, [
    project.id,
    project.manualEntries,
    project.weeklyGoalMinutes,
    project.progressPercent,
    sessionLog,
  ]);

  const hasAnyActivity =
    sessionLog.some((e) => e.session.projectId === project.id) ||
    (project.manualEntries?.length ?? 0) > 0 ||
    project.progressPercent > 0;

  const W = 600;
  const H = 200;
  const PAD_L = 40;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const maxMinutes = Math.max(
    1,
    ...points.map((p) => p.cumulativeMinutes)
  );
  const maxPercent = 100;
  const stepX = innerW / Math.max(1, points.length - 1);

  const yForMinutes = (m: number) =>
    PAD_T + innerH - (m / maxMinutes) * innerH;
  const xForIndex = (i: number) => PAD_L + i * stepX;

  const linePath = points
    .map((p, i) =>
      `${i === 0 ? "M" : "L"}${xForIndex(i).toFixed(1)},${yForMinutes(
        p.cumulativeMinutes
      ).toFixed(1)}`
    )
    .join(" ");

  const areaPath =
    points.length > 0
      ? `M${PAD_L},${PAD_T + innerH} ${points
          .map(
            (p, i) =>
              `L${xForIndex(i).toFixed(1)},${yForMinutes(
                p.cumulativeMinutes
              ).toFixed(1)}`
          )
          .join(" ")} L${xForIndex(points.length - 1).toFixed(1)},${
          PAD_T + innerH
        } Z`
      : "";

  const yTicks = [0, 0.5, 1];
  const labelEvery = Math.ceil(points.length / 5);

  return (
    <Card>
      <CardHeader
        title="Progress Over Time"
        subtitle="Cumulative focus time across the last 12 weeks"
        trailing={
          <span className="text-[11px] text-text-muted uppercase tracking-wider">
            This Quarter
          </span>
        }
      />
      <div className="mt-4">
        {hasAnyActivity ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto"
            role="img"
            aria-label="Cumulative progress over the last 12 weeks"
          >
            <defs>
              <linearGradient id="proj-progress-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B7CF6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8B7CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {yTicks.map((t) => {
              const y = PAD_T + innerH - t * innerH;
              return (
                <g key={t}>
                  <line
                    x1={PAD_L}
                    x2={PAD_L + innerW}
                    y1={y}
                    y2={y}
                    stroke="#1F2638"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD_L - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize={10}
                    fill="#6B7390"
                    className="tabular-nums"
                  >
                    {Math.round(t * maxPercent)}%
                  </text>
                </g>
              );
            })}
            <path d={areaPath} fill="url(#proj-progress-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#8B7CF6"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.length > 0 && (
              <circle
                cx={xForIndex(points.length - 1)}
                cy={yForMinutes(points[points.length - 1].cumulativeMinutes)}
                r={3.5}
                fill="#8B7CF6"
                stroke="#0B0F1A"
                strokeWidth={2}
              />
            )}
            {points.map((p, i) =>
              i % labelEvery === 0 || i === points.length - 1 ? (
                <text
                  key={p.weekStart}
                  x={xForIndex(i)}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6B7390"
                >
                  {p.label}
                </text>
              ) : null
            )}
          </svg>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-text-muted">
            No focus time logged yet — start a session to see progress.
          </div>
        )}
      </div>
    </Card>
  );
}
