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
  /** Route to navigate to. `null` means the item is a placeholder (not yet routable). */
  path: string | null;
  badge?: number;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "today", label: "Today", icon: Home, path: "/today" },
  { id: "focus", label: "Focus Sessions", icon: Clock, path: null },
  { id: "projects", label: "Projects", icon: Folder, path: null },
  { id: "learning", label: "Learning Path", icon: Map, path: null },
  { id: "progress", label: "Progress", icon: BarChart3, path: null },
  { id: "insights", label: "Insights", icon: PieChart, path: "/insights" },
  { id: "inbox", label: "Inbox", icon: Inbox, path: null, badge: 7 },
];
