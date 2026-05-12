import { Home, Folder, Map, TrendingUp, PieChart } from "lucide-react";
import { NavLink } from "react-router-dom";

type BottomItem = {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
};

const ITEMS: BottomItem[] = [
  { id: "today", label: "Today", icon: Home, path: "/today" },
  { id: "projects", label: "Projects", icon: Folder, path: "/projects" },
  { id: "learning", label: "Learning Path", icon: Map, path: "/learning" },
];

const ITEMS_RIGHT: BottomItem[] = [
  { id: "insights", label: "Insights", icon: PieChart, path: "/insights" },
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
