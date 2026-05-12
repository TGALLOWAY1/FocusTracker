import { ExternalLink, MoreHorizontal } from "lucide-react";

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
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-card border border-border-subtle px-3 py-2.5">
      <span className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center shrink-0">
        <NotionMark />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text-primary font-medium leading-tight">
          Synced with Notion
        </div>
        <div className="text-[11px] text-text-muted mt-0.5">
          Last synced 2m ago
        </div>
      </div>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Coming soon"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-bg-elevated text-xs text-text-secondary cursor-not-allowed opacity-80"
      >
        <span>Open in Notion</span>
        <ExternalLink size={12} />
      </button>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Coming soon"
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted cursor-not-allowed opacity-80"
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}
