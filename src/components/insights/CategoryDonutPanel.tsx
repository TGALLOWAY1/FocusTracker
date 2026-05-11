import { Card, CardHeader } from "../ui/Card";
import { CategoryDonut } from "./CategoryDonut";
import { ACTIVITY_CATEGORIES } from "../../data/activityCategories";
import { formatHM } from "../../utils/time";
import type { CategorySlice } from "../../state/useInsightsData";

type Props = {
  slices: CategorySlice[];
  totalMinutes: number;
};

export function CategoryDonutPanel({ slices, totalMinutes }: Props) {
  const isEmpty = slices.length === 0;
  const centerLabel = totalMinutes === 0 ? "0h" : formatHM(totalMinutes);
  return (
    <Card>
      <CardHeader
        title="Time by Activity Category"
        subtitle="Where is your attention actually going?"
      />
      <div className="mt-4 flex justify-center">
        <div className="w-[168px]">
          <CategoryDonut
            slices={slices}
            centerLabel={centerLabel}
            centerSub="Total"
          />
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {isEmpty ? (
          <li className="text-xs text-text-muted text-center py-2">
            No category data yet — your sessions will appear here.
          </li>
        ) : (
          slices.map((slice) => {
            const meta = ACTIVITY_CATEGORIES[slice.category];
            return (
              <li
                key={slice.category}
                className="flex items-center gap-2.5 text-xs"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                <span className="text-text-primary font-medium flex-1 truncate">
                  {meta.label}
                </span>
                <span className="text-text-secondary tabular-nums">
                  {formatHM(slice.minutes)}
                </span>
                <span className="text-text-muted tabular-nums w-10 text-right">
                  {Math.round(slice.percent * 100)}%
                </span>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}
