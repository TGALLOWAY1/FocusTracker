export type ActivityCategory =
  | "coding"
  | "learning"
  | "planning"
  | "reading"
  | "design"
  | "music"
  | "other";

export type ActivityCategoryMeta = {
  id: ActivityCategory;
  label: string;
  /** Hex color used in SVG charts (donut, trend lines). */
  color: string;
  /** Tailwind class for soft background (chips, badges). */
  bgClass: string;
  /** Tailwind class for text/accent color. */
  textClass: string;
};

export const ACTIVITY_CATEGORIES: Record<ActivityCategory, ActivityCategoryMeta> = {
  coding: {
    id: "coding",
    label: "Coding",
    color: "#8B7CF6",
    bgClass: "bg-brand-purpleSoft",
    textClass: "text-brand-purple",
  },
  learning: {
    id: "learning",
    label: "Learning",
    color: "#5FD68A",
    bgClass: "bg-accent-greenSoft",
    textClass: "text-accent-green",
  },
  planning: {
    id: "planning",
    label: "Planning",
    color: "#F5C76E",
    bgClass: "bg-accent-yellowSoft",
    textClass: "text-accent-yellow",
  },
  reading: {
    id: "reading",
    label: "Reading",
    color: "#67C7F2",
    bgClass: "bg-[rgba(103,199,242,0.14)]",
    textClass: "text-[#67C7F2]",
  },
  design: {
    id: "design",
    label: "Design",
    color: "#E47CC5",
    bgClass: "bg-[rgba(228,124,197,0.14)]",
    textClass: "text-[#E47CC5]",
  },
  music: {
    id: "music",
    label: "Music",
    color: "#F59E6E",
    bgClass: "bg-accent-orangeSoft",
    textClass: "text-accent-orange",
  },
  other: {
    id: "other",
    label: "Other",
    color: "#6B7390",
    bgClass: "bg-bg-elevated",
    textClass: "text-text-secondary",
  },
};

export const CATEGORY_ORDER: ActivityCategory[] = [
  "coding",
  "learning",
  "planning",
  "reading",
  "design",
  "music",
  "other",
];
