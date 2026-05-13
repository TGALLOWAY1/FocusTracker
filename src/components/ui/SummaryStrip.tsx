import type { ReactNode } from "react";

export type SummaryItem = {
  label: string;
  value: ReactNode;
};

type Props = {
  items: SummaryItem[];
  className?: string;
  ariaLabel?: string;
};

export function SummaryStrip({ items, className, ariaLabel }: Props) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm ${className ?? ""}`}
    >
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="flex items-baseline gap-2 min-w-0">
          {idx > 0 && (
            <span aria-hidden className="text-text-muted select-none">
              ·
            </span>
          )}
          <span className="font-medium tabular-nums text-text-primary">
            {item.value}
          </span>
          <span className="text-xs uppercase tracking-wide text-text-muted">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
