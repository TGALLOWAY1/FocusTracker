import { useState } from "react";
import { PanelLeftClose, Plus } from "lucide-react";
import type { LearningSubtopic } from "../../data/learningPath";
import { Eyebrow } from "../ui/Eyebrow";
import { SubtopicCard } from "./SubtopicCard";
import { ResourceList } from "./ResourceList";
import { SubtopicFormModal } from "./SubtopicFormModal";
import { ResourceFormModal } from "./ResourceFormModal";

type Props = {
  topic: LearningSubtopic | null;
  notesSubtopicId: string;
  onSelectChild: (id: string) => void;
  onHideOverview: () => void;
};

function StatusBadge({ subtopic }: { subtopic: LearningSubtopic }) {
  if (subtopic.status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-purpleSoft text-brand-purple text-xs font-medium">
        In Progress
      </span>
    );
  }
  if (subtopic.status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-greenSoft text-accent-green text-xs font-medium">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-text-muted text-xs font-medium border border-border-subtle">
      Not Started
    </span>
  );
}

export function TopicDetail({
  topic,
  notesSubtopicId,
  onSelectChild,
  onHideOverview,
}: Props) {
  if (!topic) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-text-muted text-sm">
        Select a subtopic from the outline to view its details.
      </div>
    );
  }

  const children = topic.children ?? [];
  const resources = topic.resources ?? [];

  const [subtopicModalOpen, setSubtopicModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary truncate">
            <span className="text-text-muted tabular-nums mr-2 text-base font-medium">
              {topic.numericLabel}
            </span>
            {topic.title}
          </h2>
          <StatusBadge subtopic={topic} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onHideOverview}
            title="Hide overview"
            aria-label="Hide overview"
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-cardHover transition-colors"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {topic.description && (
        <p className="text-sm text-text-secondary -mt-3">
          {topic.description}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Eyebrow className="px-1">Subtopics</Eyebrow>
        {children.map((child) => (
          <SubtopicCard
            key={child.id}
            subtopic={child}
            selected={child.id === notesSubtopicId}
            onClick={() => onSelectChild(child.id)}
          />
        ))}
        {children.length === 0 && (
          <div className="text-sm text-text-muted px-1 italic">No subtopics yet.</div>
        )}
        <button
          type="button"
          onClick={() => setSubtopicModalOpen(true)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 mt-1 rounded-xl border border-dashed border-border-subtle text-text-secondary text-sm hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <Plus size={14} />
          <span>Add Subtopic</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center justify-between px-1">
          <Eyebrow>Resources</Eyebrow>
        </div>
        <ResourceList resources={resources} />
        <button
          type="button"
          onClick={() => setResourceModalOpen(true)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 mt-1 rounded-xl border border-dashed border-border-subtle text-text-secondary text-sm hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <Plus size={14} />
          <span>Add Resource</span>
        </button>
      </div>

      {subtopicModalOpen && (
        <SubtopicFormModal
          open={subtopicModalOpen}
          onClose={() => setSubtopicModalOpen(false)}
          parentId={topic.id}
        />
      )}
      {resourceModalOpen && (
        <ResourceFormModal
          open={resourceModalOpen}
          onClose={() => setResourceModalOpen(false)}
          subtopicId={topic.id}
        />
      )}
    </div>
  );
}
