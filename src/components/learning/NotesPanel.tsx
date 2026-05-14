import { useState, type FormEvent } from "react";
import { AtSign, FileText, Image, Plus, X } from "lucide-react";
import type { LearningNote, LearningSubtopic } from "../../data/learningPath";
import type { RightTab } from "../../state/learningStore";
import { NotionSyncCard } from "./NotionSyncCard";
import { NoteContent } from "./NoteContent";
import { ResourceList } from "./ResourceList";

type Props = {
  subtopic: LearningSubtopic | null;
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  onAppendNote: (subtopicId: string, text: string) => void;
  onUpdateNote: (partial: Partial<LearningNote>) => void;
  onUpdateUserParagraph: (
    subtopicId: string,
    index: number,
    text: string
  ) => void;
  onRemoveUserParagraph: (subtopicId: string, index: number) => void;
  onStartNote: () => void;
};

const TABS: { id: RightTab; label: string; count?: (s: LearningSubtopic | null) => number }[] = [
  { id: "notes", label: "Notes" },
  {
    id: "resources",
    label: "Resources",
    count: (s) => s?.resources?.length ?? 0,
  },
  { id: "tasks", label: "Tasks", count: () => 3 },
];

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle p-6 text-sm text-text-muted text-center">
      {message}
    </div>
  );
}

function StartNoteCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
        <FileText size={18} className="text-text-secondary" />
      </div>
      <div className="text-sm text-text-secondary">
        No notes yet for this subtopic.
      </div>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-purple text-white text-xs font-medium hover:bg-brand-purpleDeep transition-colors"
      >
        <Plus size={12} />
        Start notes
      </button>
    </div>
  );
}

function TabBar({
  active,
  onChange,
  subtopic,
}: {
  active: RightTab;
  onChange: (tab: RightTab) => void;
  subtopic: LearningSubtopic | null;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border-subtle">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const count = tab.count?.(subtopic);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "relative px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
              isActive
                ? "text-brand-purple border-brand-purple"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
            {typeof count === "number" && (
              <span className="ml-1 text-text-muted">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AddNoteInput({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-auto flex items-center gap-2 rounded-xl bg-bg-card border border-border-subtle px-3 py-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a note..."
        className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:text-brand-purple hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Add note"
      >
        <Plus size={14} />
      </button>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Coming soon"
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted cursor-not-allowed opacity-70"
      >
        <Image size={14} />
      </button>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Coming soon"
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted cursor-not-allowed opacity-70"
      >
        <AtSign size={14} />
      </button>
    </form>
  );
}

export function NotesPanel({
  subtopic,
  activeTab,
  onTabChange,
  onAppendNote,
  onUpdateNote,
  onUpdateUserParagraph,
  onRemoveUserParagraph,
  onStartNote,
}: Props) {
  if (!subtopic) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <EmptyState message="Select a subtopic to view its notes." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-text-primary">
            <span className="text-text-muted tabular-nums mr-2 text-sm">
              {subtopic.numericLabel}
            </span>
            {subtopic.title}
          </h2>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary cursor-not-allowed opacity-80"
        >
          <X size={16} />
        </button>
      </div>

      <TabBar active={activeTab} onChange={onTabChange} subtopic={subtopic} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin -mx-1 px-1">
        {activeTab === "notes" && (
          <div className="flex flex-col gap-4">
            <NotionSyncCard />
            {subtopic.note ? (
              <NoteContent
                note={subtopic.note}
                onUpdate={onUpdateNote}
                onUpdateUserParagraph={(index, text) =>
                  onUpdateUserParagraph(subtopic.id, index, text)
                }
                onRemoveUserParagraph={(index) =>
                  onRemoveUserParagraph(subtopic.id, index)
                }
              />
            ) : (
              <StartNoteCard onStart={onStartNote} />
            )}
          </div>
        )}

        {activeTab === "resources" && (
          <ResourceList resources={subtopic.resources ?? []} />
        )}

        {activeTab === "tasks" && (
          <EmptyState message="Tasks are coming soon." />
        )}
      </div>

      {activeTab === "notes" && (
        <AddNoteInput
          onSubmit={(text) => onAppendNote(subtopic.id, text)}
        />
      )}
    </div>
  );
}
