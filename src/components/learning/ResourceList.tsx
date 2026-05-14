import { BookOpen, ExternalLink, FileText, PlayCircle, Newspaper } from "lucide-react";
import type {
  LearningResource,
  LearningResourceKind,
} from "../../data/learningPath";

type Props = {
  resources: LearningResource[];
};

const KIND_LABEL: Record<LearningResourceKind, string> = {
  video: "Video",
  book: "Book",
  pdf: "PDF",
  article: "Article",
};

const KIND_PILL: Record<LearningResourceKind, string> = {
  video: "bg-brand-purpleSoft text-brand-purple",
  book: "bg-accent-yellowSoft text-accent-yellow",
  pdf: "bg-accent-orangeSoft text-accent-orange",
  article: "bg-accent-greenSoft text-accent-green",
};

function KindIcon({ kind }: { kind: LearningResourceKind }) {
  const className = "text-text-secondary";
  switch (kind) {
    case "video":
      return <PlayCircle size={16} className={className} />;
    case "book":
      return <BookOpen size={16} className={className} />;
    case "pdf":
      return <FileText size={16} className={className} />;
    case "article":
      return <Newspaper size={16} className={className} />;
  }
}

export function ResourceList({ resources }: Props) {
  if (!resources.length) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle p-4 text-sm text-text-muted text-center">
        No resources yet.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {resources.map((resource) => (
        <li
          key={resource.id}
          className="flex items-center gap-3 rounded-xl bg-bg-card border border-border-subtle px-3 py-2.5"
        >
          <span className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
            <KindIcon kind={resource.kind} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text-primary truncate">
              {resource.title}
            </div>
            {resource.meta && (
              <div className="text-[11px] text-text-muted truncate">
                {resource.meta}
              </div>
            )}
          </div>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${KIND_PILL[resource.kind]}`}
          >
            {KIND_LABEL[resource.kind]}
          </span>
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              title={`Open ${resource.title}`}
            >
              <ExternalLink size={14} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="No URL provided"
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted cursor-not-allowed opacity-50"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
