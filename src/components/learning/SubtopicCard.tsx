import { CheckCircle2, Circle, FileText } from "lucide-react";
import type { LearningSubtopic } from "../../data/learningPath";
import { ProgressRing } from "../ui/ProgressRing";

type Props = {
  subtopic: LearningSubtopic;
  selected: boolean;
  onClick: () => void;
};

function StatusPill({ subtopic }: { subtopic: LearningSubtopic }) {
  if (subtopic.status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-greenSoft text-accent-green text-xs font-medium">
        <CheckCircle2 size={12} strokeWidth={2.4} />
        Completed
      </span>
    );
  }
  if (subtopic.status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-2 text-text-secondary text-xs font-medium">
        <ProgressRing
          progress={subtopic.progress ?? 0.5}
          size={20}
          stroke={2.5}
          color="#8B7CF6"
        />
        <span className="text-brand-purple tabular-nums">
          {Math.round((subtopic.progress ?? 0) * 100)}%
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-text-muted text-xs font-medium border border-border-subtle">
      <Circle size={10} strokeWidth={2} />
      Not Started
    </span>
  );
}

export function SubtopicCard({ subtopic, selected, onClick }: Props) {
  const baseClasses =
    "w-full text-left rounded-2xl bg-bg-card border shadow-card p-4 flex items-center gap-4 transition-colors";
  const stateClasses = selected
    ? "border-brand-purple/40 bg-bg-cardHover"
    : "border-border-subtle hover:bg-bg-cardHover hover:border-border-strong";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
    >
      <span className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center shrink-0">
        <FileText size={16} className="text-text-secondary" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span className="text-text-muted tabular-nums text-xs">
            {subtopic.numericLabel}
          </span>
          <span className="truncate">{subtopic.title}</span>
        </div>
        {subtopic.description && (
          <div className="mt-0.5 text-xs text-text-secondary truncate">
            {subtopic.description}
          </div>
        )}
      </div>
      <div className="shrink-0">
        <StatusPill subtopic={subtopic} />
      </div>
    </button>
  );
}
