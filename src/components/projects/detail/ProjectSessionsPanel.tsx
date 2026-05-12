import { useMemo } from "react";
import { PlayCircle } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { useFocusStore } from "../../../state/focusStore";
import { ACTIVITY_CATEGORIES } from "../../../data/activityCategories";
import { formatHM } from "../../../utils/time";
import type { Project } from "../../../data/projects";

type Props = {
  project: Project;
  limit?: number;
};

function formatSessionTime(endedAt: number): string {
  const d = new Date(endedAt);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isToday) return `Today, ${time}`;
  const dateLabel = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${dateLabel}, ${time}`;
}

export function ProjectSessionsPanel({ project, limit }: Props) {
  const sessionLog = useFocusStore((s) => s.sessionLog);
  const sessions = useMemo(() => {
    const filtered = sessionLog
      .filter((e) => e.session.projectId === project.id)
      .slice()
      .sort((a, b) => b.session.endedAt - a.session.endedAt);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [sessionLog, project.id, limit]);

  return (
    <Card>
      <CardHeader
        title="Recent Focus Sessions"
        trailing={
          limit && sessions.length === limit ? (
            <span className="text-xs text-brand-purple">View all</span>
          ) : undefined
        }
      />
      {sessions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-subtle bg-bg-elevated/40 p-5 text-center">
          <p className="text-sm text-text-secondary">No focus sessions yet.</p>
          <p className="mt-1 text-xs text-text-muted">
            Start your first deep work session for this project.
          </p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col">
          {sessions.map(({ session }) => {
            const meta = ACTIVITY_CATEGORIES[session.activityCategory];
            const minutes = Math.round(session.actualDurationSec / 60);
            return (
              <li
                key={session.id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-bg-cardHover"
              >
                <span className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0 text-text-secondary">
                  <PlayCircle size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {session.task || session.project}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${meta.bgClass} ${meta.textClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-text-muted">
                    {formatSessionTime(session.endedAt)}
                  </div>
                  <div className="text-sm font-semibold text-accent-green tabular-nums">
                    {formatHM(minutes)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
