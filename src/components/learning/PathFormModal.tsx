import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import { useLearningStore } from "../../state/learningStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PathFormModal({ open, onClose }: Props) {
  const createPath = useLearningStore((s) => s.createPath);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const isValid = title.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    createPath(title.trim(), subtitle.trim());
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create new Learning Path"
      description="Define a new roadmap for your learning journey."
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Title</Eyebrow>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master React"
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Subtitle</Eyebrow>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. From zero to hero"
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
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
          Create path
        </button>
      </footer>
    </Modal>
  );
}
