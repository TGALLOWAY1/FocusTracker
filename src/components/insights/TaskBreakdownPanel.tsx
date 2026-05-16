import { Card, CardHeader } from "../ui/Card";
import { formatHM } from "../../utils/time";
import type { TaskTagSlice } from "../../state/useInsightsData";

type Props = {
  slices: TaskTagSlice[];
};

export function TaskBreakdownPanel({ slices }: Props) {
  const isEmpty = slices.length === 0;
  return (
    <Card>
      <CardHeader
        title="Time by Task"
        subtitle="Tag finished tasks to see where the work goes."
      />
      {isEmpty ? (
        <div className="mt-4 py-3 text-xs text-text-muted text-center">
          No task time yet — expand a session below to set durations and tags.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {slices.map((slice) => (
            <li key={slice.tag} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-primary font-medium flex-1 truncate">
                  {slice.tag}
                </span>
                <span className="text-text-secondary tabular-nums">
                  {formatHM(slice.minutes)}
                </span>
                <span className="text-text-muted tabular-nums w-10 text-right">
                  {Math.round(slice.percent * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-purple"
                  style={{
                    width: `${Math.max(2, Math.round(slice.percent * 100))}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
