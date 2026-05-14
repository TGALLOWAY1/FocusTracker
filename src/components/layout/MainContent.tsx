import { useState } from "react";
import { Sunrise, Sparkles } from "lucide-react";
import { FocusSessionCard } from "../dashboard/FocusSessionCard";
import { IdeaParkingLot } from "../dashboard/IdeaParkingLot";
import { PlanMyDayModal } from "../dashboard/PlanMyDayModal";
import { SessionReflectionModal } from "../dashboard/SessionReflectionModal";

function Greeting({ onPlan }: { onPlan: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-accent-yellowSoft flex items-center justify-center shrink-0">
          <Sunrise size={24} className="text-accent-yellow" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-text-primary">
            Good morning, Alex.
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            One focused session can change your entire day.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlan}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-purple/30 transition-colors"
      >
        <Sparkles size={16} className="text-brand-purple" />
        <span>Plan My Day</span>
      </button>
    </div>
  );
}

export function MainContent() {
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <main className="flex flex-col p-6 min-w-0 overflow-y-auto scrollbar-thin">
      <Greeting onPlan={() => setPlanOpen(true)} />
      <div className="mt-5">
        <FocusSessionCard />
      </div>
      <div className="mt-3">
        <IdeaParkingLot />
      </div>
      <PlanMyDayModal open={planOpen} onClose={() => setPlanOpen(false)} />
      <SessionReflectionModal />
    </main>
  );
}
