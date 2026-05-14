import { Plus, Search } from "lucide-react";
import type { LearningModule } from "../../data/learningPath";
import { ModuleRow } from "./ModuleRow";

type Props = {
  modules: LearningModule[];
  expandedModuleIds: string[];
  selectedSubtopicId: string;
  onToggleModule: (id: string) => void;
  onSelectSubtopic: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export function ModuleOutline({
  modules,
  expandedModuleIds,
  selectedSubtopicId,
  onToggleModule,
  onSelectSubtopic,
  onExpandAll,
  onCollapseAll,
}: Props) {
  const allExpanded =
    modules.length > 0 &&
    modules.every((m) => expandedModuleIds.includes(m.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={allExpanded ? onCollapseAll : onExpandAll}
          aria-pressed={allExpanded}
          className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted hover:text-text-primary transition-colors"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary cursor-not-allowed opacity-70"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary cursor-not-allowed opacity-70"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {modules.map((module) => (
          <ModuleRow
            key={module.id}
            module={module}
            expanded={expandedModuleIds.includes(module.id)}
            selectedSubtopicId={selectedSubtopicId}
            onToggle={() => onToggleModule(module.id)}
            onSelectSubtopic={onSelectSubtopic}
          />
        ))}
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Coming soon"
        className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border-subtle text-text-muted text-sm cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity"
      >
        <Plus size={14} />
        <span>Add Custom Module</span>
      </button>
    </div>
  );
}
