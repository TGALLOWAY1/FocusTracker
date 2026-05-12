import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../ui/Modal";
import { useProjectStore } from "../../../state/projectStore";
import type { ProjectNote } from "../../../data/projects";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  existing?: ProjectNote | null;
};

export function AddNoteModal({ open, onClose, projectId, existing }: Props) {
  const addNote = useProjectStore((s) => s.addNote);
  const updateNote = useProjectStore((s) => s.updateNote);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);

  useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setBody(existing?.body ?? "");
      setPinned(existing?.pinned ?? false);
    }
  }, [open, existing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle && !cleanBody) return;
    if (existing) {
      updateNote(projectId, existing.id, {
        title: cleanTitle || "Untitled",
        body: cleanBody,
        pinned,
      });
    } else {
      addNote(projectId, {
        title: cleanTitle || "Untitled",
        body: cleanBody,
        pinned,
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit note" : "New note"}
      description="Capture an idea, blocker, or breakthrough."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-text-muted">
            Title
          </span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-text-muted">
            Body
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your thoughts..."
            rows={6}
            className="bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 resize-none"
          />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-text-secondary select-none">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="accent-brand-purple"
          />
          Pin to top
        </label>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 h-9 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() && !body.trim()}
            className="px-4 h-9 rounded-lg text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
          >
            {existing ? "Save changes" : "Save note"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
