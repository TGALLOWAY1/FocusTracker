import { useState } from "react";
import { PieChart } from "lucide-react";
import {
  useInsightsData,
  type InsightsFilters,
} from "../../state/useInsightsData";
import { SummaryCards } from "./SummaryCards";
import { InsightsFiltersBar } from "./InsightsFilters";
import { SessionsFeed } from "./SessionsFeed";
import { CategoryDonutPanel } from "./CategoryDonutPanel";
import { CategoryTrendPanel } from "./CategoryTrendPanel";
import { QuickFiltersPanel } from "./QuickFiltersPanel";
import { InsightsEmptyState } from "./InsightsEmptyState";

function Heading() {
  return (
    <div className="flex items-start gap-4 min-w-0">
      <div className="w-12 h-12 rounded-2xl bg-brand-purpleSoft flex items-center justify-center shrink-0">
        <PieChart size={22} className="text-brand-purple" />
      </div>
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-text-primary">
          Insights
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your focus journey, in review.
        </p>
      </div>
    </div>
  );
}

export function InsightsPage() {
  const [filters, setFilters] = useState<InsightsFilters>({
    dateRange: "week",
    quickFilter: "all",
    projectId: null,
  });
  const data = useInsightsData(filters);

  const filterIsActive =
    filters.quickFilter !== "all" || !!filters.projectId;

  return (
    <>
      <main className="flex flex-col gap-5 p-6 min-w-0 overflow-y-auto scrollbar-thin">
        <Heading />

        {data.logEmpty ? (
          <InsightsEmptyState />
        ) : (
          <>
            <InsightsFiltersBar filters={filters} onChange={setFilters} />
            <SummaryCards summary={data.summary} />
            <SessionsFeed
              sessions={data.sessions}
              filterIsActive={filterIsActive}
            />
          </>
        )}
      </main>

      <aside className="hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
        <CategoryDonutPanel
          slices={data.byCategory}
          totalMinutes={data.summary.totalMinutes}
        />
        <CategoryTrendPanel trend={data.trend} />
        <QuickFiltersPanel
          active={filters.quickFilter}
          onChange={(quickFilter) => setFilters({ ...filters, quickFilter })}
        />
      </aside>
    </>
  );
}
