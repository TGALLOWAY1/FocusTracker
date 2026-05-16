import { useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import {
  deriveHeadlineInsight,
  formatHeadlineInsightDuration,
  useInsightsData,
  type InsightsFilters,
} from "../../state/useInsightsData";
import { formatHM } from "../../utils/time";
import { SummaryStrip, type SummaryItem } from "../ui/SummaryStrip";
import { InsightsFiltersBar } from "./InsightsFilters";
import { SessionsFeed } from "./SessionsFeed";
import { CategoryDonutPanel } from "./CategoryDonutPanel";
import { CategoryTrendPanel } from "./CategoryTrendPanel";
import { TaskBreakdownPanel } from "./TaskBreakdownPanel";

import { InsightsEmptyState } from "./InsightsEmptyState";
import { useUIStore } from "../../state/uiStore";
import { PanelRightClose } from "lucide-react";

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

function formatRating(rating: number): string {
  if (rating === 0) return "—";
  return `${rating.toFixed(1)} / 5`;
}

function rangeLabel(range: InsightsFilters["dateRange"]): string {
  switch (range) {
    case "week":
      return "This week";
    case "month":
      return "Last 30 days";
    case "all":
      return "All time";
  }
}

export function InsightsPage() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);
  const [filters, setFilters] = useState<InsightsFilters>({
    dateRange: "week",
    quickFilter: "all",
    projectId: null,
  });
  const data = useInsightsData(filters);

  const filterIsActive =
    filters.quickFilter !== "all" || !!filters.projectId;

  const summaryItems = useMemo<SummaryItem[]>(() => {
    const { summary } = data;
    const empty = summary.sessionCount === 0;
    return [
      {
        value: empty ? "—" : formatHM(summary.totalMinutes),
        label: "Focus",
      },
      {
        value: empty ? "0" : String(summary.sessionCount),
        label: summary.sessionCount === 1 ? "Session" : "Sessions",
      },
      {
        value: empty ? "—" : `${Math.round(summary.completionRate * 100)}%`,
        label: "Completion",
      },
      {
        value: formatRating(summary.avgFocusRating),
        label: "Avg Focus",
      },
    ];
  }, [data]);

  const headline = useMemo(() => deriveHeadlineInsight(data), [data]);

  return (
    <>
      <main className="flex flex-col gap-5 p-6 min-w-0 overflow-y-auto scrollbar-thin">
        <Heading />

        {data.logEmpty ? (
          <InsightsEmptyState />
        ) : (
          <>
            <InsightsFiltersBar filters={filters} onChange={setFilters} />
            <div className="flex flex-col gap-2">
              <SummaryStrip
                items={summaryItems}
                ariaLabel={`${rangeLabel(filters.dateRange)} summary`}
                className="px-1"
              />
              {headline && (
                <p className="px-1 text-sm text-text-secondary">
                  Most of your focus went to{" "}
                  <strong className="font-semibold text-text-primary">
                    {headline.topCategoryLabel}
                  </strong>{" "}
                  ({formatHeadlineInsightDuration(headline.topCategoryMinutes)})
                  {headline.longestSessionMinutes !== null && (
                    <>
                      . Longest session:{" "}
                      <strong className="font-semibold text-text-primary">
                        {formatHeadlineInsightDuration(
                          headline.longestSessionMinutes
                        )}
                      </strong>
                    </>
                  )}
                  .
                </p>
              )}
            </div>
            <SessionsFeed
              sessions={data.sessions}
              filterIsActive={filterIsActive}
            />
          </>
        )}
      </main>

      {rightSidebarOpen && (
        <aside className="relative hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
          <button
            onClick={toggleRightSidebar}
            className="absolute top-4 right-4 z-10 p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
            title="Collapse side panel"
          >
            <PanelRightClose size={16} />
          </button>
          <CategoryDonutPanel
            slices={data.byCategory}
            totalMinutes={data.summary.totalMinutes}
          />
          <CategoryTrendPanel trend={data.trend} />
          <TaskBreakdownPanel slices={data.taskBreakdown} />
        </aside>
      )}
    </>
  );
}
