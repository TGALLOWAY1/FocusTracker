import { useEffect, useRef, useState } from "react";
import { Lightbulb, MoreHorizontal, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { useProjectStore } from "../../../state/projectStore";
import { AddNoteModal } from "./AddNoteModal";
import type { Project, ProjectNote } from "../../../data/projects";

type Props = {
  project: Project;
  compact?: boolean;
  limit?: number;
  onViewAll?: () => void;
};

function noteDate(note: ProjectNote): string {
  const ms = note.updatedAt ?? note.createdAt;
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortedNotes(notes: ProjectNote[]): ProjectNote[] {
  return notes.slice().sort((a, b) => {
    const pinDiff = Number(b.pinned ?? false) - Number(a.pinned ?? false);
    if (pinDiff !== 0) return pinDiff;
    return (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt);
  });
}

export function ProjectNotesPanel({ project, compact, limit, onViewAll }: Props) {
  const removeNote = useProjectStore((s) => s.removeNote);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectNote | null>(null);

  const notes = sortedNotes(project.notes ?? []);
  const visible = limit ? notes.slice(0, limit) : notes;

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (note: ProjectNote) => {
    setEditing(note);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Notes"
          trailing={
            onViewAll && notes.length > visible.length ? (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs text-brand-purple hover:underline"
              >
                View all
              </button>
            ) : undefined
          }
        />
        {visible.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border-subtle bg-bg-elevated/40 p-5 text-center">
            <p className="text-sm text-text-secondary">No notes yet.</p>
            <p className="mt-1 text-xs text-text-muted">
              Capture ideas, blockers, and breakthroughs here.
            </p>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {visible.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                compact={compact}
                onEdit={() => openEdit(note)}
                onRemove={() => removeNote(project.id, note.id)}
              />
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={openNew}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary border border-dashed border-border-subtle hover:border-brand-purple/40 transition-colors"
        >
          <Plus size={14} /> New Note
        </button>
      </Card>
      <AddNoteModal
        open={modalOpen}
        onClose={closeModal}
        projectId={project.id}
        existing={editing}
      />
    </>
  );
}

function NoteRow({
  note,
  compact,
  onEdit,
  onRemove,
}: {
  note: ProjectNote;
  compact?: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  return (
    <li className="rounded-xl bg-bg-elevated/60 border border-border-subtle p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-accent-yellow shrink-0">
          {note.pinned ? <Pin size={12} /> : <Lightbulb size={12} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text-primary truncate">
            {note.title}
          </div>
          {note.body && (
            <p
              className={`mt-1 text-xs text-text-secondary whitespace-pre-wrap ${
                compact ? "line-clamp-2" : ""
              }`}
            >
              {note.body}
            </p>
          )}
          <div className="mt-1.5 text-[11px] text-text-muted">
            {noteDate(note)}
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Note actions"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-cardHover"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-36 bg-bg-card border border-border-subtle rounded-xl shadow-xl shadow-black/40 py-1 z-10"
            >
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-cardHover"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onRemove();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-bg-cardHover"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
