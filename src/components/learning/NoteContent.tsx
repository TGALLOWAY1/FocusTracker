import { Lightbulb, Plus, Trash2 } from "lucide-react";
import type { LearningNote } from "../../data/learningPath";
import { Eyebrow } from "../ui/Eyebrow";
import { InlineText } from "../ui/InlineText";

type Props = {
  note: LearningNote;
  onUpdate: (partial: Partial<LearningNote>) => void;
  onUpdateUserParagraph: (index: number, text: string) => void;
  onRemoveUserParagraph: (index: number) => void;
};

export function NoteContent({
  note,
  onUpdate,
  onUpdateUserParagraph,
  onRemoveUserParagraph,
}: Props) {
  function updateBullet(index: number, text: string) {
    const next = note.bullets.slice();
    next[index] = text;
    onUpdate({ bullets: next });
  }

  function removeBullet(index: number) {
    const next = note.bullets.slice();
    next.splice(index, 1);
    onUpdate({ bullets: next });
  }

  function addBullet() {
    onUpdate({ bullets: [...note.bullets, ""] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <InlineText
          value={note.heading}
          onChange={(next) => onUpdate({ heading: next })}
          placeholder="Note heading"
          ariaLabel="Edit heading"
          className="text-lg font-semibold tracking-tight text-text-primary"
        />
        <div className="mt-2">
          <InlineText
            value={note.intro}
            onChange={(next) => onUpdate({ intro: next })}
            variant="textarea"
            placeholder="Introduce this note..."
            ariaLabel="Edit intro"
            rows={3}
            className="text-sm text-text-secondary leading-relaxed"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-text-primary">Key Steps</h4>
        <ul className="mt-2 flex flex-col gap-1">
          {note.bullets.map((bullet, index) => (
            <li
              key={index}
              className="group flex items-start gap-2 text-sm text-text-secondary leading-relaxed"
            >
              <span className="text-text-muted mt-1.5 shrink-0">•</span>
              <div className="flex-1 min-w-0">
                <InlineText
                  value={bullet}
                  onChange={(next) => updateBullet(index, next)}
                  placeholder="New step"
                  ariaLabel={`Edit step ${index + 1}`}
                  className="text-sm text-text-secondary leading-relaxed"
                />
              </div>
              <button
                type="button"
                onClick={() => removeBullet(index)}
                aria-label={`Remove step ${index + 1}`}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-accent-orange hover:bg-bg-cardHover transition-all"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addBullet}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-purple transition-colors"
        >
          <Plus size={12} />
          Add step
        </button>
      </div>

      <div className="rounded-xl bg-brand-purpleSoft border border-brand-purple/20 px-3.5 py-3 flex items-start gap-2.5">
        <Lightbulb size={16} className="text-accent-yellow mt-0.5 shrink-0" />
        <div className="text-sm flex-1 min-w-0">
          <span className="font-semibold text-text-primary">Insight</span>
          <div className="mt-0.5">
            <InlineText
              value={note.insight}
              onChange={(next) => onUpdate({ insight: next })}
              variant="textarea"
              placeholder="Capture an insight..."
              ariaLabel="Edit insight"
              rows={2}
              className="text-sm text-text-secondary leading-relaxed"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-text-primary">
          Example Workflow
        </h4>
        <div className="mt-2 rounded-xl bg-bg-elevated border border-border-subtle overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle">
            <Eyebrow as="span">
              <InlineText
                value={note.code.language}
                onChange={(next) =>
                  onUpdate({ code: { ...note.code, language: next } })
                }
                placeholder="Language"
                ariaLabel="Edit code language"
                className="text-[11px] uppercase tracking-wider font-medium text-text-muted"
              />
            </Eyebrow>
          </div>
          <div className="p-2">
            <InlineText
              value={note.code.source}
              onChange={(next) =>
                onUpdate({ code: { ...note.code, source: next } })
              }
              variant="textarea"
              placeholder="Paste code..."
              ariaLabel="Edit code"
              rows={6}
              monospace
              className="text-[12px] leading-relaxed font-mono text-text-primary"
            />
          </div>
        </div>
      </div>

      {note.userParagraphs.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
          {note.userParagraphs.map((paragraph, index) => (
            <div
              key={index}
              className="group flex items-start gap-2"
            >
              <div className="flex-1 min-w-0">
                <InlineText
                  value={paragraph}
                  onChange={(next) => onUpdateUserParagraph(index, next)}
                  variant="textarea"
                  placeholder="Your note..."
                  ariaLabel={`Edit note paragraph ${index + 1}`}
                  rows={2}
                  className="text-sm text-text-secondary leading-relaxed"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveUserParagraph(index)}
                aria-label={`Remove note paragraph ${index + 1}`}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-accent-orange hover:bg-bg-cardHover transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
