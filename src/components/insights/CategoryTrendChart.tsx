import { ACTIVITY_CATEGORIES } from "../../data/activityCategories";
import type { CategoryTrend } from "../../state/useInsightsData";

type Props = {
  trend: CategoryTrend;
};

export function CategoryTrendChart({ trend }: Props) {
  const { points, series, maxHours } = trend;
  const width = 320;
  const height = 168;
  const padLeft = 26;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const stepX = points.length > 1 ? chartW / (points.length - 1) : 0;
  const yTicks = [0, maxHours / 2, maxHours];

  const xFor = (i: number) => padLeft + i * stepX;
  const yFor = (hours: number) =>
    padTop + chartH - (Math.min(hours, maxHours) / maxHours) * chartH;

  const labelStep = points.length > 14 ? Math.ceil(points.length / 7) : 1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
      role="img"
      aria-label={
        series.length === 0
          ? "No category trend data yet"
          : `Trend lines for ${series
              .map((s) => ACTIVITY_CATEGORIES[s.category].label)
              .join(", ")} across ${points.length} points`
      }
    >
      {/* Y gridlines */}
      {yTicks.map((v) => {
        const y = yFor(v);
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
              {v === 0 ? "0" : `${Math.round(v * 10) / 10}h`}
            </text>
          </g>
        );
      })}

      {/* X labels */}
      {points.map((p, i) => {
        if (i % labelStep !== 0 && i !== points.length - 1) return null;
        return (
          <text
            key={p.timestamp}
            x={xFor(i)}
            y={height - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#A3ABBF"
          >
            {p.label}
          </text>
        );
      })}

      {/* Lines */}
      {series.map((s) => {
        const color = ACTIVITY_CATEGORIES[s.category].color;
        const path = s.values
          .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`)
          .join(" ");
        return (
          <g key={s.category}>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Endpoint dot */}
            {s.values.length > 0 && (
              <circle
                cx={xFor(s.values.length - 1)}
                cy={yFor(s.values[s.values.length - 1])}
                r={3}
                fill={color}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
