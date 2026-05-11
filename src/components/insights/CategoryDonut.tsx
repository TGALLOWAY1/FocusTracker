import { ACTIVITY_CATEGORIES } from "../../data/activityCategories";
import type { CategorySlice } from "../../state/useInsightsData";

type Props = {
  slices: CategorySlice[];
  centerLabel?: string;
  centerSub?: string;
  size?: number;
  thickness?: number;
};

// Donut math: an SVG arc per slice along a single ring of radius `r`.
// We render arcs as <circle> with `strokeDasharray` so each slice can have
// its own color without computing path strings.
export function CategoryDonut({
  slices,
  centerLabel,
  centerSub,
  size = 168,
  thickness = 18,
}: Props) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const total = slices.reduce((sum, s) => sum + s.percent, 0);
  const hasData = total > 0;

  let offsetSoFar = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={
        hasData
          ? slices
              .map(
                (s) =>
                  `${ACTIVITY_CATEGORIES[s.category].label}: ${Math.round(s.percent * 100)}%`
              )
              .join(", ")
          : "No category data yet"
      }
      className="w-full h-auto"
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#1F2638"
        strokeWidth={thickness}
      />

      {hasData &&
        slices.map((slice) => {
          const length = slice.percent * circumference;
          const dashArray = `${length} ${circumference - length}`;
          // Start at top (-90deg), then walk forward by offsetSoFar.
          const dashOffset = circumference - offsetSoFar;
          offsetSoFar += length;
          const color = ACTIVITY_CATEGORIES[slice.category].color;
          return (
            <circle
              key={slice.category}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}

      {centerLabel && (
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
          fontWeight={600}
          fill="#F4F6FB"
          className="tabular-nums"
        >
          {centerLabel}
        </text>
      )}
      {centerSub && (
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#A3ABBF"
        >
          {centerSub}
        </text>
      )}
    </svg>
  );
}
