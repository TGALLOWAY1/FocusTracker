import { useState, type FormEvent } from "react";
import {
  ExternalLink,
  FileText,
  Github,
  HardDrive,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { useProjectStore } from "../../../state/projectStore";
import type { Project, ProjectLinkIcon } from "../../../data/projects";

type Props = {
  project: Project;
};

function iconFor(icon?: ProjectLinkIcon) {
  switch (icon) {
    case "github":
      return Github;
    case "notion":
      return FileText;
    case "drive":
      return HardDrive;
    default:
      return LinkIcon;
  }
}

function guessIcon(url: string): ProjectLinkIcon {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) return "github";
  if (lower.includes("notion.")) return "notion";
  if (lower.includes("drive.google") || lower.includes("docs.google"))
    return "drive";
  return "link";
}

export function ProjectLinksCard({ project }: Props) {
  const addLink = useProjectStore((s) => s.addLink);
  const removeLink = useProjectStore((s) => s.removeLink);
  const links = project.links ?? [];
  const [adding, setAdding] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const title = titleDraft.trim();
    const url = urlDraft.trim();
    if (!title || !url) return;
    addLink(project.id, { title, url, icon: guessIcon(url) });
    setTitleDraft("");
    setUrlDraft("");
    setAdding(false);
  };

  return (
    <Card>
      <CardHeader title="Project Links" />
      <ul className="mt-3 flex flex-col">
        {links.map((link) => {
          const Icon = iconFor(link.icon);
          return (
            <li
              key={link.id}
              className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-bg-cardHover"
            >
              <span className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-secondary shrink-0">
                <Icon size={14} />
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex-1 min-w-0 flex items-center gap-2 text-sm text-text-primary hover:text-brand-purple"
              >
                <span className="truncate">{link.title}</span>
                <ExternalLink size={12} className="text-text-muted shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => removeLink(project.id, link.id)}
                aria-label="Remove link"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </li>
          );
        })}
      </ul>

      {adding ? (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="Title"
            className="h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
          />
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://..."
            className="h-9 bg-bg-elevated border border-border-subtle rounded-lg px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!titleDraft.trim() || !urlDraft.trim()}
              className="px-3 h-8 rounded-lg text-xs font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
            >
              Add Link
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setTitleDraft("");
                setUrlDraft("");
              }}
              className="px-3 h-8 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={14} /> Add Link
        </button>
      )}
    </Card>
  );
}
