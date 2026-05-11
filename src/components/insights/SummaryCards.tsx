import { Clock, CheckCircle2, Target, Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { formatHM } from "../../utils/time";
import type { InsightsSummary } from "../../state/useInsightsData";

type CardProps = {
  label: string;
  value: string;
  helper?: string;
  Icon: typeof Clock;
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
}: CardProps) {
  return (
    <Card className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
          {label}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={16} className={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div className={`text-[26px] leading-none font-semibold tracking-tight tabular-nums ${valueClass}`}>
        {value}
      </div>
      {helper && (
        <div className="text-[11px] text-text-muted leading-tight">{helper}</div>
      )}
    </Card>
  );
}

function formatRating(rating: number): string {
  if (rating === 0) return "—";
  return `${rating.toFixed(1)} / 5`;
}

export function SummaryCards({ summary }: { summary: InsightsSummary }) {
  const isEmpty = summary.sessionCount === 0;
  const completionLabel = isEmpty
    ? "—"
    : `${Math.round(summary.completionRate * 100)}%`;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard
        label="Total Focus Time"
        value={isEmpty ? "—" : formatHM(summary.totalMinutes)}
        Icon={Clock}
        iconBg="bg-accent-greenSoft"
        iconColor="text-accent-green"
        valueClass="text-accent-green"
      />
      <StatCard
        label="Sessions"
        value={isEmpty ? "—" : String(summary.sessionCount)}
        Icon={CheckCircle2}
        iconBg="bg-brand-purpleSoft"
        iconColor="text-brand-purple"
        valueClass="text-brand-purple"
      />
      <StatCard
        label="Completion Rate"
        value={completionLabel}
        Icon={Target}
        iconBg="bg-accent-yellowSoft"
        iconColor="text-accent-yellow"
        valueClass="text-accent-yellow"
      />
      <StatCard
        label="Avg Focus Rating"
        value={formatRating(summary.avgFocusRating)}
        Icon={Sparkles}
        iconBg="bg-accent-orangeSoft"
        iconColor="text-accent-orange"
        valueClass="text-accent-orange"
      />
    </div>
  );
}
