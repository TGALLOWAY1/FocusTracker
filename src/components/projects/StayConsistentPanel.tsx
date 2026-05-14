import { Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { useWeeklyStats } from "../../state/useWeeklyStats";

function Sparkline({
  values,
  maxY,
}: {
  values: number[];
  maxY: number;
}) {
  const width = 240;
  const height = 64;
  const pad = 6;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  if (values.length === 0) return null;
  const stepX = innerW / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const ratio = maxY === 0 ? 0 : v / maxY;
    const y = pad + innerH - ratio * innerH;
    return { x, y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${path} L${(pad + innerW).toFixed(1)} ${(pad + innerH).toFixed(1)} L${pad} ${(pad + innerH).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Weekly focus trend"
      className="w-full h-auto"
    >
      <defs>
        <linearGradient id="stay-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B7CF6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8B7CF6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#stay-grad)" />
      <path
        d={path}
        fill="none"
        stroke="#8B7CF6"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2}
          fill="#0B0F1A"
          stroke="#8B7CF6"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

export function StayConsistentPanel() {
  const weekly = useWeeklyStats();
  const values = weekly.daily.map((d) => d.hours);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-purpleSoft flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-brand-purple" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Stay consistent
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            Small daily progress leads to massive results.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Sparkline values={values} maxY={weekly.maxYHours} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted tabular-nums">
        <span>Mon</span>
        <span>Sun</span>
      </div>
    </Card>
  );
}
