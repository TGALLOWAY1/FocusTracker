import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { useProjectStore } from "../../../state/projectStore";
import type { Project } from "../../../data/projects";

type Props = {
  project: Project;
};

export function ProjectTagsCard({ project }: Props) {
  const upsertProject = useProjectStore((s) => s.upsertProject);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const tag = draft.trim();
    if (!tag) return;
    if (project.tags.includes(tag)) {
      setDraft("");
      return;
    }
    upsertProject({ ...project, tags: [...project.tags, tag] });
    setDraft("");
    setAdding(false);
  };

  const handleRemove = (tag: string) => {
    upsertProject({
      ...project,
      tags: project.tags.filter((t) => t !== tag),
    });
  };

  return (
    <Card>
      <CardHeader title="Project Tags" />
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="group inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle"
          >
            {t}
            <button
              type="button"
              onClick={() => handleRemove(t)}
              aria-label={`Remove ${t}`}
              className="w-4 h-4 rounded flex items-center justify-center text-text-muted hover:text-accent-red"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {adding ? (
          <form onSubmit={handleAdd} className="inline-flex items-center gap-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                if (!draft.trim()) setAdding(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraft("");
                  setAdding(false);
                }
              }}
              placeholder="New tag"
              className="h-6 w-24 bg-bg-elevated border border-brand-purple/40 rounded-md px-1.5 text-[11px] text-text-primary focus-visible:outline-none"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="Add tag"
            className="inline-flex items-center justify-center w-6 h-6 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-cardHover"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </Card>
  );
}
