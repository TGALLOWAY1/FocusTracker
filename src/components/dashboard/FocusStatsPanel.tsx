
import { Card, CardHeader } from "../ui/Card";
import { SummaryStrip, type SummaryItem } from "../ui/SummaryStrip";
import type { DayStat, FocusStatsData } from "../../data/focusStats";
import { formatHM } from "../../utils/time";

type WeeklyBarChartProps = {
  daily: DayStat[];
  maxYHours: number;
};

function WeeklyBarChart({ daily, maxYHours }: WeeklyBarChartProps) {
  const width = 320;
  const height = 110;
  const padLeft = 24;
  const padRight = 4;
  const padTop = 6;
  const padBottom = 20;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const slotW = chartW / daily.length;
  const barW = 14;
  const yTicks = [0, maxYHours];

  const summary = daily
    .map((d) => `${d.day}: ${formatHM(Math.round(d.hours * 60))}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
      role="img"
      aria-label={`Weekly focus hours by day: ${summary}`}
    >
      {yTicks.map((v) => {
        const y = padTop + chartH - (v / maxYHours) * chartH;
        return (
          <g key={v}>
            <line
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke="#1F2638"
              strokeDasharray="3 3"
            />
            <text
              x={padLeft - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              fill="#6B7390"
            >
              {v === 0 ? "0" : `${v}h`}
            </text>
          </g>
        );
      })}

      {daily.map((d, i) => {
        const ratio = Math.min(1, d.hours / maxYHours);
        const barH = Math.max(2, ratio * chartH);
        const x = padLeft + i * slotW + (slotW - barW) / 2;
        const y = padTop + chartH - barH;
        return (
          <g key={d.day}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="#8B7CF6"
            />
            <text
              x={x + barW / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize={10}
              fill="#A3ABBF"
            >
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RangeIndicator() {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-elevated">
      This Week
    </span>
  );
}

type FocusStatsPanelProps = {
  data: FocusStatsData;
};

export function FocusStatsPanel({ data }: FocusStatsPanelProps) {
  const isEmpty = data.sessionCount === 0;
  const items: SummaryItem[] = [
    {
      value: isEmpty ? "—" : formatHM(data.totalMinutes),
      label: "Focus",
    },
    {
      value: isEmpty ? "0" : String(data.sessionCount),
      label: data.sessionCount === 1 ? "Session" : "Sessions",
    },
    {
      value: isEmpty ? "—" : `${Math.round(data.completionRate * 100)}%`,
      label: "Completion",
    },
  ];

  return (
    <Card>
      <CardHeader title="Focus Stats" trailing={<RangeIndicator />} />
      <div className="mt-3">
        <SummaryStrip items={items} ariaLabel="This week's focus stats" />
      </div>
      <div className="mt-4">
        <WeeklyBarChart daily={data.daily} maxYHours={data.maxYHours} />
      </div>
    </Card>
  );
}
