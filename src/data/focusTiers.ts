import { Sprout, Mountain, MountainSnow, type LucideIcon } from "lucide-react";

export type FocusTier = {
  id: number;
  label: string;
  minutes: number;
  durationLabel: string;
  xpToNext: number;
  icon: LucideIcon;
};

export const FOCUS_TIERS: FocusTier[] = [
  { id: 1, label: "Tier 1", minutes: 10, durationLabel: "10 min", xpToNext: 250, icon: Sprout },
  { id: 2, label: "Tier 2", minutes: 20, durationLabel: "20 min", xpToNext: 500, icon: Sprout },
  { id: 3, label: "Tier 3", minutes: 35, durationLabel: "35 min", xpToNext: 2000, icon: Mountain },
  { id: 4, label: "Tier 4", minutes: 50, durationLabel: "50 min", xpToNext: 4000, icon: Mountain },
  { id: 5, label: "Tier 5", minutes: 75, durationLabel: "75 min", xpToNext: 8000, icon: Mountain },
  { id: 6, label: "Tier 6", minutes: 90, durationLabel: "90+ min", xpToNext: Infinity, icon: MountainSnow },
];

export type TierStatus = "completed" | "current" | "locked";

export function tierStatus(tierId: number, currentTierId: number): TierStatus {
  if (tierId < currentTierId) return "completed";
  if (tierId === currentTierId) return "current";
  return "locked";
}

export function getTier(tierId: number): FocusTier | undefined {
  return FOCUS_TIERS.find((t) => t.id === tierId);
}
