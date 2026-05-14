import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import { useLearningStore } from "../../state/learningStore";

type Props = {
  open: boolean;
  onClose: () => void;
  currentUrl?: string;
};

export function NotionSyncModal({ open, onClose, currentUrl }: Props) {
  const updatePathSync = useLearningStore((s) => s.updatePathSync);
  const [url, setUrl] = useState(currentUrl ?? "");

  const handleSubmit = () => {
    updatePathSync(url.trim() || undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notion Sync"
      description="Link this learning path to a Notion page for quick access."
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Notion Page URL</Eyebrow>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://notion.so/..."
            className="h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
            autoFocus
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
          className="h-10 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple/90 transition-colors"
        >
          Save & Sync
        </button>
      </footer>
    </Modal>
  );
}
