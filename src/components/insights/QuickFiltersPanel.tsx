import { Card, CardHeader } from "../ui/Card";
import type { QuickFilter } from "../../state/useInsightsData";

type Props = {
  active: QuickFilter;
  onChange: (next: QuickFilter) => void;
};

const ITEMS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All Sessions" },
  { id: "completed", label: "Completed" },
  { id: "endedEarly", label: "Ended Early" },
  { id: "deep", label: "Deep Work" },
  { id: "light", label: "Light Work" },
];

export function QuickFiltersPanel({ active, onChange }: Props) {
  return (
    <Card>
      <CardHeader title="Quick Filters" />
      <div className="mt-3 flex flex-col gap-1.5">
        {ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={[
                "text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                isActive
                  ? "bg-brand-purpleSoft text-text-primary border-brand-purple/25"
                  : "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-cardHover border-transparent",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
