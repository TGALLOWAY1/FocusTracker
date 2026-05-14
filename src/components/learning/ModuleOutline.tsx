import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { LearningModule } from "../../data/learningPath";
import { ModuleRow } from "./ModuleRow";
import { ModuleFormModal } from "./ModuleFormModal";

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

  const [formOpen, setFormOpen] = useState(false);

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
            onClick={() => setFormOpen(true)}
            title="Add Custom Module"
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
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
        onClick={() => setFormOpen(true)}
        className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border-subtle text-text-secondary text-sm hover:text-text-primary hover:bg-bg-elevated transition-colors"
      >
        <Plus size={14} />
        <span>Add Custom Module</span>
      </button>

      {formOpen && (
        <ModuleFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
