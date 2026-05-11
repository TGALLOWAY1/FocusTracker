import { ChevronRight, Flame, Target, Star } from "lucide-react";
import { NAV_ITEMS, ACTIVE_NAV_ID } from "../../data/navItems";
import { Card } from "../ui/Card";
import { useFocusStore } from "../../state/focusStore";
import { useWeeklyStats } from "../../state/useWeeklyStats";
import { FOCUS_TIERS, getTier } from "../../data/focusTiers";
import { clamp } from "../../utils/time";

function FocusLadderLogo() {
  return (
    <div className="flex items-center gap-3 px-2">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="ladderGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B7CF6" />
            <stop offset="100%" stopColor="#5FD68A" />
          </linearGradient>
        </defs>
        <path
          d="M18 5 L26 18 L22 18 L28 28 L8 28 L14 18 L10 18 Z"
          fill="url(#ladderGrad)"
          opacity="0.95"
        />
        <path
          d="M18 11 L22 18 L18 18 Z"
          fill="#0B0F1A"
          opacity="0.55"
        />
      </svg>
      <div className="leading-tight">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-text-primary">
          FOCUS
        </div>
        <div className="text-[11px] font-semibold tracking-[0.18em] text-text-primary">
          LADDER
        </div>
      </div>
    </div>
  );
}

function NavList() {
  return (
    <nav className="mt-6 flex flex-col gap-1 px-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.id === ACTIVE_NAV_ID;
        return (
          <div
            key={item.id}
            className={[
              "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default select-none transition-colors",
              active
                ? "bg-brand-purpleSoft text-text-primary border border-brand-purple/20"
                : "text-text-secondary hover:bg-bg-cardHover hover:text-text-primary border border-transparent",
            ].join(" ")}
          >
            <Icon
              size={18}
              className={active ? "text-brand-purple" : "text-text-secondary"}
              strokeWidth={2}
            />
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {item.badge !== undefined && (
              <span className="text-[11px] font-semibold text-text-secondary bg-bg-elevated rounded-md px-2 py-0.5">
                {item.badge}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function MountainMark() {
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden="true">
      <path
        d="M4 42 L22 14 L32 28 L42 18 L60 42 Z"
        fill="#3A3568"
        opacity="0.85"
      />
      <path
        d="M22 14 L28 22 L18 30 Z"
        fill="#5B4DCB"
        opacity="0.9"
      />
      <path
        d="M22 14 L24 12 L26 14"
        stroke="#F26E6E"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="11" r="1.2" fill="#F26E6E" />
    </svg>
  );
}

function FocusTierCard() {
  const currentTierId = useFocusStore((s) => s.currentTierId);
  const xp = useFocusStore((s) => s.xp);

  const tier = getTier(currentTierId);
  const nextTier = FOCUS_TIERS.find((t) => t.id === currentTierId + 1);

  if (!tier) return null;

  const hasFiniteGoal = Number.isFinite(tier.xpToNext);
  const xpProgress = hasFiniteGoal ? clamp(xp / tier.xpToNext, 0, 1) : 1;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
            Focus Tier
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-brand-purple">
              {tier.label}
            </span>
          </div>
          <div className="text-xs text-text-secondary mt-0.5">
            {tier.durationLabel} sessions
          </div>
        </div>
        <div className="-mr-2 -mt-1">
          <MountainMark />
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-purple to-accent-green transition-[width] duration-500"
            style={{ width: `${xpProgress * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary tabular-nums">
          <span>
            {xp.toLocaleString()} /{" "}
            {hasFiniteGoal ? tier.xpToNext.toLocaleString() : "∞"} XP
          </span>
        </div>
        <div className="mt-1 text-[11px] text-text-muted">
          {nextTier
            ? `Next Tier: ${nextTier.durationLabel} sessions`
            : "Peak tier reached"}
        </div>
      </div>
    </Card>
  );
}

type StreakRowProps = {
  value: string;
  unit: string;
  label: string;
  iconBg: string;
  iconColor: string;
  Icon: typeof Flame;
};

function StreakRow({ value, unit, label, iconBg, iconColor, Icon }: StreakRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-lg font-semibold text-text-primary leading-none">
          {value}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-text-muted">
          {unit}
        </span>
      </div>
      <span className="ml-auto text-xs text-text-secondary truncate">{label}</span>
    </div>
  );
}

function StreaksCard() {
  const focusStreakDays = useFocusStore((s) => s.focusStreakDays);
  const projectStreakDays = useFocusStore((s) => s.projectStreakDays);
  const weeklyStats = useWeeklyStats();
  const deepWorkHours = Math.floor(weeklyStats.totalMinutes / 60);

  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-4">
        Current Streaks
      </div>
      <div className="flex flex-col gap-3">
        <StreakRow
          value={String(focusStreakDays)}
          unit="Days"
          label="Focus Streak"
          Icon={Flame}
          iconBg="bg-accent-greenSoft"
          iconColor="text-accent-green"
        />
        <StreakRow
          value={String(projectStreakDays)}
          unit="Days"
          label="Project Streak"
          Icon={Target}
          iconBg="bg-brand-purpleSoft"
          iconColor="text-brand-purple"
        />
        <StreakRow
          value={String(deepWorkHours)}
          unit="Hours"
          label="Deep Work This Week"
          Icon={Star}
          iconBg="bg-accent-yellowSoft"
          iconColor="text-accent-yellow"
        />
      </div>
    </Card>
  );
}

function ProfileRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-bg-card border border-border-subtle">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-accent-green flex items-center justify-center text-sm font-semibold text-bg-base">
        A
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-text-primary truncate">Alex</div>
        <div className="text-[11px] text-text-muted truncate">Keep climbing.</div>
      </div>
      <ChevronRight size={16} className="text-text-muted" />
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 border-r border-border-subtle bg-bg-base p-4 min-h-0">
      <div className="pt-3">
        <FocusLadderLogo />
      </div>
      <NavList />
      <div className="mt-2 flex flex-col gap-4">
        <FocusTierCard />
        <StreaksCard />
      </div>
      <div className="mt-auto">
        <ProfileRow />
      </div>
    </aside>
  );
}
