import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import { useLearningStore } from "../../state/learningStore";
import type { LearningResourceKind } from "../../data/learningPath";
import { newId } from "../../utils/id";

type Props = {
  open: boolean;
  onClose: () => void;
  subtopicId: string;
};

const RESOURCE_KINDS: { kind: LearningResourceKind; label: string }[] = [
  { kind: "article", label: "Article" },
  { kind: "video", label: "Video" },
  { kind: "book", label: "Book" },
  { kind: "pdf", label: "PDF" },
];

export function ResourceFormModal({ open, onClose, subtopicId }: Props) {
  const addResource = useLearningStore((s) => s.addResource);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<LearningResourceKind>("article");

  const isValid = title.trim().length > 0 && url.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    addResource(subtopicId, {
      id: newId("res"),
      title: title.trim(),
      kind,
      url: url.trim(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Resource"
      description="Link an external article, video, or book."
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Title</Eyebrow>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Docs - Context"
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Eyebrow>URL</Eyebrow>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Type</Eyebrow>
          <div className="flex items-center gap-1 bg-bg-elevated rounded-xl p-1">
            {RESOURCE_KINDS.map((opt) => {
              const active = kind === opt.kind;
              return (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => setKind(opt.kind)}
                  className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? "bg-bg-card text-text-primary border border-border-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
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
          Add Resource
        </button>
      </footer>
    </Modal>
  );
}
