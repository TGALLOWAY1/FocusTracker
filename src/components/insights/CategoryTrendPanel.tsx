import { Card, CardHeader } from "../ui/Card";
import { CategoryTrendChart } from "./CategoryTrendChart";
import { ACTIVITY_CATEGORIES } from "../../data/activityCategories";
import type { CategoryTrend } from "../../state/useInsightsData";

export function CategoryTrendPanel({ trend }: { trend: CategoryTrend }) {
  const isEmpty = trend.series.length === 0;
  return (
    <Card>
      <CardHeader
        title="Time by Category Over Time"
        subtitle="Long-term patterns in your focus."
      />
      <div className="mt-4">
        <CategoryTrendChart trend={trend} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {isEmpty ? (
          <div className="text-[11px] text-text-muted">
            Categories will appear here as you complete sessions.
          </div>
        ) : (
          trend.series.map((s) => {
            const meta = ACTIVITY_CATEGORIES[s.category];
            return (
              <div
                key={s.category}
                className="flex items-center gap-1.5 text-[11px] text-text-secondary"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                {meta.label}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
