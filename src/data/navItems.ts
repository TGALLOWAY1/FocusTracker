import {
  Home,
  Folder,
  Map,
  PieChart,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "today", label: "Today", icon: Home, path: "/today" },
  { id: "projects", label: "Projects", icon: Folder, path: "/projects" },
  { id: "learning", label: "Learning Path", icon: Map, path: "/learning" },
  { id: "insights", label: "Insights", icon: PieChart, path: "/insights" },
];
