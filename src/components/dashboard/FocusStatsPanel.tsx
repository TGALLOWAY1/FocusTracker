import { ChevronDown } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import type { DayStat, FocusStatsData } from "../../data/focusStats";
import { formatHM } from "../../utils/time";

type StatProps = {
  value: string;
  label: string;
  valueClass: string;
};

function Stat({ value, label, valueClass }: StatProps) {
  return (
    <div className="min-w-0">
      <div
        className={`text-[26px] leading-none font-semibold tracking-tight tabular-nums ${valueClass}`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-text-secondary leading-tight">
        {label}
      </div>
    </div>
  );
}

type WeeklyBarChartProps = {
  daily: DayStat[];
  maxYHours: number;
};

function WeeklyBarChart({ daily, maxYHours }: WeeklyBarChartProps) {
  const width = 320;
  const height = 168;
  const padLeft = 26;
  const padRight = 4;
  const padTop = 8;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const slotW = chartW / daily.length;
  const barW = 18;
  const yTicks = [0, maxYHours / 2, maxYHours];

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
      {/* Y axis gridlines + labels */}
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

      {/* Bars + day labels */}
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
              rx={4}
              fill="#8B7CF6"
            />
            <text
              x={x + barW / 2}
              y={height - 6}
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
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-text-secondary bg-bg-elevated">
      This Week
      <ChevronDown size={12} className="text-text-muted" />
    </span>
  );
}

type FocusStatsPanelProps = {
  data: FocusStatsData;
};

export function FocusStatsPanel({ data }: FocusStatsPanelProps) {
  const isEmpty = data.sessionCount === 0;
  const completionLabel = isEmpty
    ? "—"
    : `${Math.round(data.completionRate * 100)}%`;

  return (
    <Card>
      <CardHeader title="Focus Stats" trailing={<RangeIndicator />} />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat
          value={formatHM(data.totalMinutes)}
          label="Total Focus Time"
          valueClass="text-accent-green"
        />
        <Stat
          value={String(data.sessionCount)}
          label="Sessions"
          valueClass="text-brand-purple"
        />
        <Stat
          value={completionLabel}
          label="Completion Rate"
          valueClass="text-accent-yellow"
        />
      </div>

      <div className="mt-5">
        <WeeklyBarChart daily={data.daily} maxYHours={data.maxYHours} />
      </div>
    </Card>
  );
}
