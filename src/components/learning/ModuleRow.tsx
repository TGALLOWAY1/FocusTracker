import { ChevronDown, ChevronRight } from "lucide-react";
import type { LearningModule } from "../../data/learningPath";
import { SubtopicOutlineRow } from "./SubtopicOutlineRow";

type Props = {
  module: LearningModule;
  expanded: boolean;
  selectedSubtopicId: string;
  onToggle: () => void;
  onSelectSubtopic: (id: string) => void;
};

export function ModuleRow({
  module,
  expanded,
  selectedSubtopicId,
  onToggle,
  onSelectSubtopic,
}: Props) {
  const pct = module.totalCount
    ? Math.round((module.completedCount / module.totalCount) * 100)
    : 0;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left hover:bg-bg-cardHover transition-colors group"
        aria-expanded={expanded}
      >
        <span className="w-7 h-7 rounded-full bg-bg-elevated text-text-secondary text-xs font-semibold flex items-center justify-center shrink-0">
          {module.numericLabel}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {module.title}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full bg-bg-elevated overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple to-accent-green"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-text-muted tabular-nums shrink-0">
              {module.completedCount} / {module.totalCount}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-text-muted shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="mt-1 flex flex-col gap-0.5 pb-2">
          {module.subtopics.map((subtopic) => (
            <SubtopicOutlineRow
              key={subtopic.id}
              subtopic={subtopic}
              selected={subtopic.id === selectedSubtopicId}
              onClick={() => onSelectSubtopic(subtopic.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
