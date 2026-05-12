import { Lightbulb, Copy } from "lucide-react";
import type { LearningNote } from "../../data/learningPath";

type Props = {
  note: LearningNote;
};

export function NoteContent({ note }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          {note.heading}
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {note.intro}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-text-primary">Key Steps</h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          {note.bullets.map((bullet) => (
            <li
              key={bullet}
              className="text-sm text-text-secondary leading-relaxed flex gap-2"
            >
              <span className="text-text-muted mt-1.5 shrink-0">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-brand-purpleSoft border border-brand-purple/20 px-3.5 py-3 flex items-start gap-2.5">
        <Lightbulb size={16} className="text-accent-yellow mt-0.5 shrink-0" />
        <div className="text-sm">
          <span className="font-semibold text-text-primary">Insight</span>
          <p className="text-text-secondary mt-0.5 leading-relaxed">
            {note.insight}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-text-primary">
          Example Workflow
        </h4>
        <div className="mt-2 rounded-xl bg-bg-elevated border border-border-subtle overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
              {note.code.language}
            </span>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Coming soon"
              className="inline-flex items-center gap-1 text-[11px] text-text-secondary cursor-not-allowed opacity-80"
            >
              <Copy size={12} />
              Copy
            </button>
          </div>
          <pre className="p-3 text-[12px] leading-relaxed font-mono text-text-primary overflow-x-auto whitespace-pre">
            <code>{note.code.source}</code>
          </pre>
        </div>
      </div>

      {note.userParagraphs.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
          {note.userParagraphs.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
