import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import { useLearningStore } from "../../state/learningStore";

type Props = {
  open: boolean;
  onClose: () => void;
  moduleId?: string;
  parentId?: string;
};

export function SubtopicFormModal({ open, onClose, moduleId, parentId }: Props) {
  const addSubtopic = useLearningStore((s) => s.addSubtopic);
  const addChildSubtopic = useLearningStore((s) => s.addChildSubtopic);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isValid = title.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    if (moduleId) {
      addSubtopic(moduleId, title.trim(), description.trim());
    } else if (parentId) {
      addChildSubtopic(parentId, title.trim(), description.trim());
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add subtopic"
      description="Create a new topic to master within this module."
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Title</Eyebrow>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Higher-Order Components"
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Description</Eyebrow>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief summary of what this topic covers."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 resize-none"
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
          Add subtopic
        </button>
      </footer>
    </Modal>
  );
}
