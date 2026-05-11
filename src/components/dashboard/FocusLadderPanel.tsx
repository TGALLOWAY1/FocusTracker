import { Check, Lock, type LucideIcon } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { useFocusStore } from "../../state/focusStore";
import {
  FOCUS_TIERS,
  tierStatus,
  type FocusTier,
  type TierStatus,
} from "../../data/focusTiers";

type TierIconProps = {
  Icon: LucideIcon;
  status: TierStatus;
};

function TierIcon({ Icon, status }: TierIconProps) {
  const bg =
    status === "completed" || status === "current"
      ? "bg-accent-greenSoft"
      : "bg-bg-elevated";
  const color =
    status === "completed" || status === "current"
      ? "text-accent-green"
      : "text-text-muted";
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
      <Icon size={18} className={color} strokeWidth={2} />
    </div>
  );
}

type TrailingProps = {
  status: TierStatus;
  xp: number;
  xpToNext: number;
};

function TierTrailing({ status, xp, xpToNext }: TrailingProps) {
  if (status === "completed") {
    return (
      <div className="w-6 h-6 rounded-full bg-accent-greenSoft flex items-center justify-center">
        <Check size={14} className="text-accent-green" strokeWidth={3} />
      </div>
    );
  }
  if (status === "current") {
    return (
      <div className="text-right">
        <div className="text-xs font-semibold text-accent-green leading-tight">
          Current
        </div>
        <div className="text-[11px] text-text-secondary leading-tight mt-0.5 tabular-nums">
          {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
        </div>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span>Locked</span>
      <Lock size={12} />
    </div>
  );
}

type TierRowProps = {
  tier: FocusTier;
  status: TierStatus;
  xp: number;
};

function TierRow({ tier, status, xp }: TierRowProps) {
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  return (
    <li
      className={[
        "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors",
        isCurrent
          ? "bg-accent-greenSoft/40 border border-accent-green/35 shadow-[0_0_0_1px_rgba(95,214,138,0.08)]"
          : "border border-transparent",
      ].join(" ")}
    >
      <TierIcon Icon={tier.icon} status={status} />
      <div className="flex items-baseline gap-2 min-w-0 flex-1">
        <span
          className={[
            "text-sm font-semibold",
            isLocked ? "text-text-muted" : "text-text-primary",
          ].join(" ")}
        >
          {tier.label}
        </span>
        <span
          className={[
            "text-xs tabular-nums",
            isCurrent
              ? "text-accent-green font-medium"
              : isLocked
              ? "text-text-muted"
              : "text-text-secondary",
          ].join(" ")}
        >
          {tier.durationLabel}
        </span>
      </div>
      <TierTrailing status={status} xp={xp} xpToNext={tier.xpToNext} />
    </li>
  );
}

export function FocusLadderPanel() {
  const currentTierId = useFocusStore((s) => s.currentTierId);
  const xp = useFocusStore((s) => s.xp);

  return (
    <Card>
      <CardHeader title="Focus Ladder" />
      <ul className="mt-3 flex flex-col gap-1">
        {FOCUS_TIERS.map((tier) => {
          const status = tierStatus(tier.id, currentTierId);
          return (
            <TierRow
              key={tier.id}
              tier={tier}
              status={status}
              xp={status === "current" ? xp : 0}
            />
          );
        })}
      </ul>
    </Card>
  );
}
