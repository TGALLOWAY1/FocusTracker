import {
  Home,
  Clock,
  Folder,
  Map,
  BarChart3,
  PieChart,
  Inbox,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "focus", label: "Focus Sessions", icon: Clock },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "learning", label: "Learning Path", icon: Map },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "insights", label: "Insights", icon: PieChart },
  { id: "inbox", label: "Inbox", icon: Inbox, badge: 7 },
];

export const ACTIVE_NAV_ID = "today";
