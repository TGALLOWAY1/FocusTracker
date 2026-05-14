import { ChevronDown } from "lucide-react";
import type { DateRange, InsightsFilters } from "../../state/useInsightsData";
import { useProjectStore } from "../../state/projectStore";

type Props = {
  filters: InsightsFilters;
  onChange: (next: InsightsFilters) => void;
};

const RANGES: { id: DateRange; label: string }[] = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export function InsightsFiltersBar({ filters, onChange }: Props) {
  const projects = useProjectStore((s) => s.projects);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-card border border-border-subtle">
        {RANGES.map((r) => {
          const active = filters.dateRange === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange({ ...filters, dateRange: r.id })}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                active
                  ? "bg-brand-purpleSoft text-brand-purple"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <select
          value={filters.projectId ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              projectId: e.target.value || null,
            })
          }
          className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary cursor-pointer outline-none focus:border-brand-purple/40 transition-colors"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>
    </div>
  );
}
