import { Plus, Search } from "lucide-react";
import type { LearningModule } from "../../data/learningPath";
import { ModuleRow } from "./ModuleRow";

type Props = {
  modules: LearningModule[];
  expandedModuleIds: string[];
  selectedSubtopicId: string;
  onToggleModule: (id: string) => void;
  onSelectSubtopic: (id: string) => void;
};

export function ModuleOutline({
  modules,
  expandedModuleIds,
  selectedSubtopicId,
  onToggleModule,
  onSelectSubtopic,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
          Expand all
        </span>
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
