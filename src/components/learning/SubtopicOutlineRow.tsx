import { CheckCircle2, Circle } from "lucide-react";
import type { LearningSubtopic } from "../../data/learningPath";
import { ProgressRing } from "../ui/ProgressRing";

type Props = {
  subtopic: LearningSubtopic;
  selected: boolean;
  onClick: () => void;
};

function StatusIcon({ subtopic }: { subtopic: LearningSubtopic }) {
  if (subtopic.status === "completed") {
    return (
      <CheckCircle2 size={16} className="text-accent-green" strokeWidth={2.2} />
    );
  }
  if (subtopic.status === "in-progress") {
    return (
      <ProgressRing
        progress={subtopic.progress ?? 0.5}
        size={16}
        stroke={2}
        color="#8B7CF6"
      />
    );
  }
  return <Circle size={16} className="text-text-muted" strokeWidth={2} />;
}

export function SubtopicOutlineRow({ subtopic, selected, onClick }: Props) {
  const baseClasses =
    "w-full flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-left text-sm transition-colors";
  const stateClasses = selected
    ? "bg-brand-purpleSoft text-text-primary border border-brand-purple/20"
    : "text-text-secondary hover:bg-bg-cardHover hover:text-text-primary border border-transparent";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
    >
      <span className="w-5 flex justify-center shrink-0">
        <StatusIcon subtopic={subtopic} />
      </span>
      <span className="text-xs text-text-muted tabular-nums w-8 shrink-0">
        {subtopic.numericLabel}
      </span>
      <span className="truncate">{subtopic.title}</span>
    </button>
  );
}
