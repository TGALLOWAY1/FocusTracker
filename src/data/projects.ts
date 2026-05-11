import { Music, BookOpen, Code2, type LucideIcon } from "lucide-react";

export type ProjectColor = "purple" | "green" | "orange";

export type ProjectIconKey = "music" | "book" | "code";

export const PROJECT_ICONS: Record<ProjectIconKey, LucideIcon> = {
  music: Music,
  book: BookOpen,
  code: Code2,
};

export type Project = {
  id: string;
  name: string;
  category: string;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  color: ProjectColor;
  iconKey: ProjectIconKey;
};

export const SEED_PROJECTS: Project[] = [
  {
    id: "harmonia-ep",
    name: "Harmonia EP",
    category: "Mixing and mastering",
    weeklyMinutes: 12 * 60 + 30,
    weeklyGoalMinutes: 1000,
    color: "purple",
    iconKey: "music",
  },
  {
    id: "ml-path",
    name: "Machine Learning Path",
    category: "Deep Learning Specialization",
    weeklyMinutes: 6 * 60 + 15,
    weeklyGoalMinutes: 750,
    color: "green",
    iconKey: "book",
  },
  {
    id: "synapse",
    name: "Synapse",
    category: "Build second brain app",
    weeklyMinutes: 3 * 60 + 40,
    weeklyGoalMinutes: 880,
    color: "orange",
    iconKey: "code",
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
