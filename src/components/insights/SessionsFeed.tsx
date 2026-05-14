import { Card, CardHeader } from "../ui/Card";
import { SessionRow } from "./SessionRow";
import { formatRelativeDate } from "../../utils/date";
import type { LoggedSession } from "../../state/focusStore";

function dayKey(ts: number): string {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return String(d.getTime());
}

type Group = {
  key: string;
  label: string;
  entries: LoggedSession[];
};

function groupByDay(sessions: LoggedSession[]): Group[] {
  const groups: Group[] = [];
  for (const entry of sessions) {
    const key = dayKey(entry.session.endedAt);
    const tail = groups[groups.length - 1];
    if (tail && tail.key === key) {
      tail.entries.push(entry);
    } else {
      groups.push({
        key,
        label: formatRelativeDate(entry.session.endedAt),
        entries: [entry],
      });
    }
  }
  return groups;
}

type Props = {
  sessions: LoggedSession[];
  filterIsActive: boolean;
};

export function SessionsFeed({ sessions, filterIsActive }: Props) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Sessions" />
        <div className="mt-4 py-10 text-center text-sm text-text-secondary">
          {filterIsActive
            ? "No sessions match the current filters."
            : "No sessions in this range yet."}
        </div>
      </Card>
    );
  }

  const groups = groupByDay(sessions);

  return (
    <Card>
      <CardHeader
        title="Recent Sessions"
        subtitle={`${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
      />
      <div className="mt-4 flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-2">
              <div className="text-xs uppercase tracking-wide font-semibold text-text-secondary">
                {group.label}
              </div>
              <div className="text-[11px] text-text-muted tabular-nums">
                {group.entries.length} session
                {group.entries.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {group.entries.map((entry) => (
                <SessionRow key={entry.session.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
