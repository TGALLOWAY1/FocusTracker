import { Home, Clock, Folder, Map, BarChart3, Plus, TrendingUp, PieChart } from "lucide-react";
import { NavLink } from "react-router-dom";

type BottomItem = {
  id: string;
  label: string;
  icon: typeof Home;
  path: string | null;
};

const ITEMS: BottomItem[] = [
  { id: "today", label: "Today", icon: Home, path: "/today" },
  { id: "focus", label: "Focus", icon: Clock, path: null },
  { id: "projects", label: "Projects", icon: Folder, path: null },
  { id: "learning", label: "Learning Path", icon: Map, path: "/learning" },
];

const ITEMS_RIGHT: BottomItem[] = [
  { id: "insights", label: "Insights", icon: PieChart, path: "/insights" },
  { id: "progress", label: "Progress", icon: BarChart3, path: null },
];

function BottomItem({ item }: { item: BottomItem }) {
  const Icon = item.icon;

  const classFor = (active: boolean) =>
    [
      "flex items-center gap-2 px-3 py-2 rounded-xl select-none transition-colors",
      active
        ? "text-brand-purple"
        : "text-text-secondary hover:text-text-primary",
    ].join(" ");

  if (item.path === null) {
    return (
      <div className={`${classFor(false)} cursor-default opacity-80`} aria-disabled="true">
        <Icon size={18} strokeWidth={2} />
        <span className="text-sm font-medium">{item.label}</span>
      </div>
    );
  }

  return (
    <NavLink to={item.path} className={({ isActive }) => classFor(isActive)}>
      <Icon size={18} strokeWidth={2} />
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  );
}

export function BottomBar() {
  return (
    <footer className="h-[72px] border-t border-border-subtle bg-bg-base/95 backdrop-blur px-6 flex items-center gap-2 relative">
      <div className="flex items-center gap-1">
        {ITEMS.map((item) => (
          <BottomItem key={item.id} item={item} />
        ))}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 -top-5">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Quick add — coming later"
          className="w-12 h-12 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(139,124,246,0.5)] cursor-not-allowed"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {ITEMS_RIGHT.map((item) => (
          <BottomItem key={item.id} item={item} />
        ))}
      </div>

      <div className="hidden xl:flex items-center gap-2 pl-6 ml-2 border-l border-border-subtle max-w-[340px]">
        <TrendingUp size={16} className="text-text-muted shrink-0" />
        <p className="text-xs italic text-text-muted leading-snug">
          "Discipline is choosing between what you want now and what you want most."
        </p>
      </div>
    </footer>
  );
}
