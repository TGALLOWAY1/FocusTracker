import { useEffect, useRef, useState } from "react";
import { Plus, Circle, Lightbulb, X, type LucideIcon } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import {
  IDEA_STATUSES,
  useIdeaStore,
  type Idea,
  type IdeaStatus,
} from "../../state/ideaStore";
import { formatRelativeDate } from "../../utils/date";

type StatusStyle = {
  pillText: string;
  pillBg: string;
  markerColor: string;
  markerIcon: LucideIcon;
};

const STATUS_STYLES: Record<IdeaStatus, StatusStyle> = {
  "Future Idea": {
    pillText: "text-accent-yellow",
    pillBg: "bg-accent-yellowSoft",
    markerColor: "text-accent-yellow",
    markerIcon: Circle,
  },
  "Maybe Later": {
    pillText: "text-brand-purple",
    pillBg: "bg-brand-purpleSoft",
    markerColor: "text-brand-purple",
    markerIcon: Circle,
  },
  Incubating: {
    pillText: "text-accent-green",
    pillBg: "bg-accent-greenSoft",
    markerColor: "text-accent-green",
    markerIcon: Lightbulb,
  },
};

type IdeaRowProps = { idea: Idea; onRemove: (id: string) => void };

function IdeaRow({ idea, onRemove }: IdeaRowProps) {
  const style = STATUS_STYLES[idea.status];
  const Marker = style.markerIcon;
  return (
    <li className="group flex items-center gap-3 py-2.5">
      <Marker size={16} className={`${style.markerColor} shrink-0`} strokeWidth={2} />
      <span className="text-sm text-text-primary flex-1 min-w-0 truncate">
        {idea.text}
      </span>
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium ${style.pillBg} ${style.pillText}`}
      >
        {idea.status}
      </span>
      <span className="text-xs text-text-muted tabular-nums w-[64px] text-right">
        {formatRelativeDate(idea.createdAt)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(idea.id)}
        aria-label={`Remove idea: ${idea.text}`}
        className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:bg-bg-elevated hover:text-text-secondary transition-opacity"
      >
        <X size={14} />
      </button>
    </li>
  );
}

type AddFormProps = {
  onSubmit: (text: string, status: IdeaStatus) => void;
  onCancel: () => void;
};

function AddIdeaForm({ onSubmit, onCancel }: AddFormProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<IdeaStatus>("Future Idea");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(trimmed, status);
    setText("");
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated px-3 py-3">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="What's on your mind?"
        className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
      />
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {IDEA_STATUSES.map((s) => {
            const style = STATUS_STYLES[s];
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={[
                  "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                  active
                    ? `${style.pillBg} ${style.pillText} border-transparent`
                    : "bg-transparent text-text-secondary border-border-subtle hover:text-text-primary",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep disabled:bg-bg-card disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
          >
            Add Idea
          </button>
        </div>
      </div>
    </div>
  );
}

export function IdeaParkingLot() {
  const ideas = useIdeaStore((s) => s.ideas);
  const addIdea = useIdeaStore((s) => s.addIdea);
  const removeIdea = useIdeaStore((s) => s.removeIdea);
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Idea Parking Lot</span>
            <span className="text-text-muted text-xs font-normal">
              {ideas.length}
            </span>
          </span>
        }
        subtitle="Capture distractions. Clear your mind. Return later."
        trailing={
          !adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purpleSoft text-brand-purple text-xs font-semibold hover:bg-brand-purple/20 transition-colors"
            >
              <Plus size={14} />
              Add Idea
            </button>
          ) : null
        }
      />

      {adding && (
        <div className="mt-4">
          <AddIdeaForm
            onSubmit={(text, status) => {
              addIdea(text, status);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-subtle py-8 text-center text-xs text-text-muted">
          No ideas parked yet. Add one when something pulls your focus.
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border-subtle/50">
          {ideas.map((idea) => (
            <IdeaRow key={idea.id} idea={idea} onRemove={removeIdea} />
          ))}
        </ul>
      )}
    </Card>
  );
}
