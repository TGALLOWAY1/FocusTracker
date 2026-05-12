import { Music, BookOpen, Code2, type LucideIcon } from "lucide-react";
import type { ActivityCategory } from "./activityCategories";

export type ProjectColor = "purple" | "green" | "orange";

export type ProjectIconKey = "music" | "book" | "code";

export const PROJECT_ICONS: Record<ProjectIconKey, LucideIcon> = {
  music: Music,
  book: BookOpen,
  code: Code2,
};

export type ProjectStatus = "active" | "on-hold" | "completed" | "archived";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "active",
  "on-hold",
  "completed",
  "archived",
];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  "on-hold": "On Hold",
  completed: "Completed",
  archived: "Archived",
};

export type CoverPresetKey =
  | "nebula"
  | "forest"
  | "sunset"
  | "cyber"
  | "audio-wave"
  | "mountain";

export const COVER_PRESET_KEYS: CoverPresetKey[] = [
  "nebula",
  "forest",
  "sunset",
  "cyber",
  "audio-wave",
  "mountain",
];

export const COVER_PRESETS: Record<CoverPresetKey, { label: string; background: string }> = {
  nebula: {
    label: "Nebula",
    background:
      "radial-gradient(120% 80% at 20% 20%, rgba(139,124,246,0.55) 0%, rgba(139,124,246,0) 60%), radial-gradient(100% 70% at 80% 80%, rgba(228,124,197,0.45) 0%, rgba(228,124,197,0) 60%), linear-gradient(135deg, #1B1E3A 0%, #2A2356 100%)",
  },
  forest: {
    label: "Forest",
    background:
      "radial-gradient(120% 80% at 70% 30%, rgba(95,214,138,0.45) 0%, rgba(95,214,138,0) 60%), radial-gradient(100% 70% at 20% 80%, rgba(139,124,246,0.30) 0%, rgba(139,124,246,0) 60%), linear-gradient(135deg, #102018 0%, #1B3026 100%)",
  },
  sunset: {
    label: "Sunset",
    background:
      "radial-gradient(120% 80% at 30% 30%, rgba(245,199,110,0.55) 0%, rgba(245,199,110,0) 60%), radial-gradient(100% 70% at 80% 70%, rgba(245,158,110,0.55) 0%, rgba(245,158,110,0) 60%), linear-gradient(135deg, #2A1A1F 0%, #3D2A1A 100%)",
  },
  cyber: {
    label: "Cyber",
    background:
      "radial-gradient(120% 80% at 25% 30%, rgba(103,199,242,0.50) 0%, rgba(103,199,242,0) 60%), radial-gradient(100% 70% at 80% 80%, rgba(139,124,246,0.40) 0%, rgba(139,124,246,0) 60%), linear-gradient(135deg, #0F1A2A 0%, #142440 100%)",
  },
  "audio-wave": {
    label: "Audio Wave",
    background:
      "radial-gradient(120% 80% at 30% 70%, rgba(228,124,197,0.55) 0%, rgba(228,124,197,0) 60%), radial-gradient(100% 70% at 80% 25%, rgba(139,124,246,0.45) 0%, rgba(139,124,246,0) 60%), linear-gradient(135deg, #1A1130 0%, #2C1A40 100%)",
  },
  mountain: {
    label: "Mountain",
    background:
      "radial-gradient(120% 80% at 60% 25%, rgba(245,199,110,0.40) 0%, rgba(245,199,110,0) 60%), radial-gradient(100% 70% at 25% 80%, rgba(139,124,246,0.40) 0%, rgba(139,124,246,0) 60%), linear-gradient(135deg, #181D2E 0%, #232744 100%)",
  },
};

export type ProjectCover =
  | { kind: "preset"; preset: CoverPresetKey }
  | { kind: "image"; dataUrl: string };

export function coverBackground(cover: ProjectCover): string {
  if (cover.kind === "image") {
    return `center / cover no-repeat url("${cover.dataUrl}")`;
  }
  return COVER_PRESETS[cover.preset].background;
}

export function presetForColor(color: ProjectColor): CoverPresetKey {
  switch (color) {
    case "purple":
      return "nebula";
    case "green":
      return "forest";
    case "orange":
      return "sunset";
  }
}

export type ManualEntry = {
  id: string;
  minutes: number;
  addedAt: number;
  note?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  tags: string[];
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  progressPercent: number;
  color: ProjectColor;
  iconKey: ProjectIconKey;
  activityCategory: ActivityCategory;
  cover: ProjectCover;
  manualEntries: ManualEntry[];
  createdAt: number;
  updatedAt: number;
};

const SEED_NOW = 1715000000000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const SEED_PROJECTS: Project[] = [
  {
    id: "ml-model-trainer",
    name: "ML Model Trainer",
    description:
      "Build and train custom ML models with visualizations and experiment tracking.",
    category: "Deep Learning Specialization",
    status: "active",
    tags: ["Deep Work", "Machine Learning"],
    weeklyMinutes: 6 * 60 + 15,
    weeklyGoalMinutes: 750,
    progressPercent: 75,
    color: "purple",
    iconKey: "code",
    activityCategory: "coding",
    cover: { kind: "preset", preset: "cyber" },
    manualEntries: [
      {
        id: "seed-ml-1",
        minutes: 42 * 60 + 15,
        addedAt: SEED_NOW - 2 * DAY_MS,
        note: "Imported historical training time",
      },
    ],
    createdAt: SEED_NOW - 60 * DAY_MS,
    updatedAt: SEED_NOW - 2 * DAY_MS,
  },
  {
    id: "habit-garden",
    name: "Habit Garden",
    description: "A gamified habit tracker that helps you grow consistent daily habits.",
    category: "Personal app",
    status: "active",
    tags: ["Productivity", "Personal"],
    weeklyMinutes: 4 * 60 + 30,
    weeklyGoalMinutes: 600,
    progressPercent: 60,
    color: "green",
    iconKey: "code",
    activityCategory: "coding",
    cover: { kind: "preset", preset: "forest" },
    manualEntries: [
      {
        id: "seed-hg-1",
        minutes: 28 * 60 + 30,
        addedAt: SEED_NOW - 5 * DAY_MS,
        note: "Imported historical build time",
      },
    ],
    createdAt: SEED_NOW - 45 * DAY_MS,
    updatedAt: SEED_NOW - 5 * DAY_MS,
  },
  {
    id: "portfolio-redesign",
    name: "Portfolio Redesign",
    description:
      "Redesign my personal portfolio with a modern, interactive experience.",
    category: "Personal website",
    status: "active",
    tags: ["Design", "Web"],
    weeklyMinutes: 3 * 60,
    weeklyGoalMinutes: 480,
    progressPercent: 40,
    color: "purple",
    iconKey: "code",
    activityCategory: "design",
    cover: { kind: "preset", preset: "audio-wave" },
    manualEntries: [
      {
        id: "seed-pr-1",
        minutes: 16 * 60 + 20,
        addedAt: SEED_NOW - 1 * DAY_MS,
        note: "Imported historical design time",
      },
    ],
    createdAt: SEED_NOW - 30 * DAY_MS,
    updatedAt: SEED_NOW - 1 * DAY_MS,
  },
  {
    id: "data-science-handbook",
    name: "Data Science Handbook",
    description:
      "Collect and summarize key concepts, cheatsheets, and practical examples.",
    category: "Reference notebook",
    status: "active",
    tags: ["Learning", "Data Science"],
    weeklyMinutes: 5 * 60,
    weeklyGoalMinutes: 600,
    progressPercent: 90,
    color: "orange",
    iconKey: "book",
    activityCategory: "learning",
    cover: { kind: "preset", preset: "mountain" },
    manualEntries: [
      {
        id: "seed-dsh-1",
        minutes: 32 * 60 + 10,
        addedAt: SEED_NOW - 1 * DAY_MS,
        note: "Imported historical study time",
      },
    ],
    createdAt: SEED_NOW - 90 * DAY_MS,
    updatedAt: SEED_NOW - 1 * DAY_MS,
  },
  {
    id: "cli-productivity-toolkit",
    name: "CLI Productivity Toolkit",
    description:
      "Custom CLI tools to streamline my daily workflow and boost productivity.",
    category: "Developer tools",
    status: "active",
    tags: ["Development"],
    weeklyMinutes: 2 * 60,
    weeklyGoalMinutes: 360,
    progressPercent: 30,
    color: "green",
    iconKey: "code",
    activityCategory: "coding",
    cover: { kind: "preset", preset: "cyber" },
    manualEntries: [
      {
        id: "seed-cli-1",
        minutes: 12 * 60 + 45,
        addedAt: SEED_NOW - 2 * DAY_MS,
        note: "Imported historical hacking time",
      },
    ],
    createdAt: SEED_NOW - 21 * DAY_MS,
    updatedAt: SEED_NOW - 2 * DAY_MS,
  },
  {
    id: "lofi-beats-collection",
    name: "Lo-fi Beats Collection",
    description:
      "Create chill lo-fi beats and build a library for focus and relaxation.",
    category: "Music project",
    status: "active",
    tags: ["Music", "Creative"],
    weeklyMinutes: 1 * 60 + 45,
    weeklyGoalMinutes: 300,
    progressPercent: 20,
    color: "orange",
    iconKey: "music",
    activityCategory: "music",
    cover: { kind: "preset", preset: "audio-wave" },
    manualEntries: [
      {
        id: "seed-lofi-1",
        minutes: 8 * 60 + 30,
        addedAt: SEED_NOW - 3 * DAY_MS,
        note: "Imported historical studio time",
      },
    ],
    createdAt: SEED_NOW - 14 * DAY_MS,
    updatedAt: SEED_NOW - 3 * DAY_MS,
  },
];

export type ProjectColorClasses = {
  iconBg: string;
  iconColor: string;
  ringStroke: string;
};

export function projectColorClasses(color: ProjectColor): ProjectColorClasses {
  switch (color) {
    case "purple":
      return {
        iconBg: "bg-brand-purpleSoft",
        iconColor: "text-brand-purple",
        ringStroke: "#8B7CF6",
      };
    case "green":
      return {
        iconBg: "bg-accent-greenSoft",
        iconColor: "text-accent-green",
        ringStroke: "#5FD68A",
      };
    case "orange":
      return {
        iconBg: "bg-accent-orangeSoft",
        iconColor: "text-accent-orange",
        ringStroke: "#F59E6E",
      };
  }
}
