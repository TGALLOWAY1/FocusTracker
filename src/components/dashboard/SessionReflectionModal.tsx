import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useFocusStore, type CompletedSession } from "../../state/focusStore";
import { formatMMSS } from "../../utils/time";

type RatingProps = {
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  activeClass: string;
};

function Rating({ value, onChange, lowLabel, highLabel, activeClass }: RatingProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value && value > 0;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} of 5`}
              className={[
                "w-9 h-9 rounded-lg text-sm font-semibold border transition-colors",
                active
                  ? activeClass
                  : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-text-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function SessionSummary({ session }: { session: CompletedSession }) {
  const focused = formatMMSS(session.actualDurationSec);
  const planned = formatMMSS(session.plannedDurationSec);
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs text-text-muted">{session.project}</div>
        <div className="text-sm font-semibold text-text-primary truncate">
          {session.task || "Focus Session"}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-base font-semibold tabular-nums text-text-primary leading-tight">
          {focused}
        </div>
        <div className="text-[11px] text-text-muted leading-tight mt-0.5 tabular-nums">
          of {planned} planned
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  optional,
}: {
  children: string;
  optional?: boolean;
}) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-2">
      {children}
      {optional && (
        <span className="ml-1.5 text-text-muted/70 normal-case tracking-normal">
          (optional)
        </span>
      )}
    </div>
  );
}

export function SessionReflectionModal() {
  const pending = useFocusStore((s) => s.pendingReflectionFor);
  const submit = useFocusStore((s) => s.submitReflection);
  const dismiss = useFocusStore((s) => s.dismissReflection);

  const [focusLevel, setFocusLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [distraction, setDistraction] = useState("");
  const [completedPlanned, setCompletedPlanned] = useState(false);

  useEffect(() => {
    if (!pending) return;
    setFocusLevel(0);
    setEnergyLevel(0);
    setDistraction("");
    setCompletedPlanned(pending.completedNaturally);
  }, [pending?.id, pending]);

  if (!pending) return null;

  const canSave = focusLevel > 0 && energyLevel > 0;

  const handleSubmit = () => {
    if (!canSave) return;
    submit({
      sessionId: pending.id,
      focusLevel,
      energyLevel,
      biggestDistraction: distraction.trim() || undefined,
      completedPlanned,
      createdAt: Date.now(),
    });
  };

  const title = pending.completedNaturally ? "Nice work." : "Session ended.";
  const description = pending.completedNaturally
    ? "You finished the session you committed to. Quick reflection while it's fresh?"
    : "Every block of focus counts. A short reflection will help next time.";

  return (
    <Modal
      open={true}
      onClose={dismiss}
      title={title}
      description={description}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <SessionSummary session={pending} />

        <div>
          <FieldLabel>How focused were you?</FieldLabel>
          <Rating
            value={focusLevel}
            onChange={setFocusLevel}
            lowLabel="Distracted"
            highLabel="Deep focus"
            activeClass="bg-accent-greenSoft border-accent-green/35 text-accent-green"
          />
        </div>

        <div>
          <FieldLabel>Energy level?</FieldLabel>
          <Rating
            value={energyLevel}
            onChange={setEnergyLevel}
            lowLabel="Drained"
            highLabel="Energized"
            activeClass="bg-accent-yellowSoft border-accent-yellow/35 text-accent-yellow"
          />
        </div>

        <div>
          <FieldLabel optional>Biggest distraction</FieldLabel>
          <input
            value={distraction}
            onChange={(e) => setDistraction(e.target.value)}
            placeholder="What pulled at your attention?"
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-purple/50 transition-colors"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={completedPlanned}
            onChange={(e) => setCompletedPlanned(e.target.checked)}
            className="sr-only peer"
          />
          <span
            className={[
              "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
              completedPlanned
                ? "bg-accent-green border-accent-green text-bg-base"
                : "bg-bg-elevated border-border-subtle text-transparent",
            ].join(" ")}
          >
            <CheckCircle2 size={14} strokeWidth={3} />
          </span>
          <span className="text-sm text-text-primary">
            I completed what I planned
          </span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/70">
          <button
            type="button"
            onClick={dismiss}
            className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles size={14} />
            Save Reflection
          </button>
        </div>
      </div>
    </Modal>
  );
}
