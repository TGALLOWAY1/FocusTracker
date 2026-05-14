import { useState } from "react";
import { ExternalLink, MoreHorizontal, Link2 } from "lucide-react";
import { useLearningStore } from "../../state/learningStore";
import { NotionSyncModal } from "./NotionSyncModal";

function NotionMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="4"
        fill="#F4F6FB"
        opacity="0.95"
      />
      <path
        d="M7 7.5 L7 16.5 M7 7.5 L14 16.5 M14 7.5 L14 16.5"
        stroke="#131826"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NotionSyncCard() {
  const paths = useLearningStore((s) => s.paths);
  const activePathId = useLearningStore((s) => s.activePathId);
  const path = paths.find((p) => p.id === activePathId);
  
  const [modalOpen, setModalOpen] = useState(false);

  if (!path) return null;

  const { notionUrl, lastSyncedAt } = path;

  // Simple relative time formatting
  const getRelativeTime = (timestamp?: number) => {
    if (!timestamp) return "Never synced";
    const diff = Math.floor((Date.now() - timestamp) / 60000); // minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-bg-card border border-border-subtle px-3 py-2.5">
        <span className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center shrink-0">
          <NotionMark />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-primary font-medium leading-tight">
            {notionUrl ? "Synced with Notion" : "Notion Sync"}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {notionUrl ? `Last synced ${getRelativeTime(lastSyncedAt)}` : "Link a Notion page"}
          </div>
        </div>
        
        {notionUrl ? (
          <a
            href={notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-bg-elevated text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>Open in Notion</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-bg-elevated text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>Link Page</span>
            <Link2 size={12} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {modalOpen && (
        <NotionSyncModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          currentUrl={notionUrl}
        />
      )}
    </>
  );
}
