import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import type { Project } from "../../data/projects";
import { useProjectStore } from "../../state/projectStore";
import { newId } from "../../utils/id";
import { formatHM } from "../../utils/time";

type Props = {
  open: boolean;
  onClose: () => void;
  project: Project;
};

export function LogManualTimeModal({ open, onClose, project }: Props) {
  const upsertProject = useProjectStore((s) => s.upsertProject);
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState("");

  const isValid = minutes > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const entry = {
      id: newId("manual"),
      minutes: Math.round(minutes),
      addedAt: Date.now(),
      note: note.trim() || undefined,
    };
    upsertProject({
      ...project,
      manualEntries: [...project.manualEntries, entry],
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log time"
      description={`Add focus time to "${project.name}".`}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <Eyebrow as="span">Minutes</Eyebrow>
          <input
            type="number"
            min={1}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) || 0)}
            className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
            autoFocus
          />
          {isValid && (
            <span className="text-[11px] text-text-secondary">
              That's {formatHM(Math.round(minutes))}.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <Eyebrow as="span">Note (optional)</Eyebrow>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you work on?"
            className="w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
          />
        </label>
      </div>

      <footer className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="h-10 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple/90 disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
        >
          Add time
        </button>
      </footer>
    </Modal>
  );
}
