import { Sunrise, Sparkles } from "lucide-react";
import { FocusSessionCard } from "../dashboard/FocusSessionCard";
import { IdeaParkingLot } from "../dashboard/IdeaParkingLot";

function Greeting() {
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
        disabled
        aria-disabled="true"
        title="Plan My Day — coming in Phase 8"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm font-medium text-text-secondary cursor-not-allowed"
      >
        <Sparkles size={16} className="text-brand-purple" />
        <span>Plan My Day</span>
      </button>
    </div>
  );
}

export function MainContent() {
  return (
    <main className="flex flex-col gap-5 p-6 min-w-0 overflow-y-auto scrollbar-thin">
      <Greeting />
      <FocusSessionCard />
      <IdeaParkingLot />
    </main>
  );
}
