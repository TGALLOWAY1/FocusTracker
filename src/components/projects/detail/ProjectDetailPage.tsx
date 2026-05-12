import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  PlayCircle,
  StickyNote,
  PencilLine,
} from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { CategoryDonut } from "../../insights/CategoryDonut";
import { useProjectStore } from "../../../state/projectStore";
import { useFocusStore } from "../../../state/focusStore";
import { useProjectStats } from "../../../state/useProjectStats";
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
} from "../../../data/activityCategories";
import { formatRelativeDate } from "../../../utils/date";
import { formatHM } from "../../../utils/time";
import type { ProjectEventKind } from "../../../data/projects";
import { ProjectFormModal } from "../ProjectFormModal";
import { LogManualTimeModal } from "../LogManualTimeModal";
import { ProjectHero } from "./ProjectHero";
import { ProjectTabs, type DetailTab } from "./ProjectTabs";
import { ProjectOverviewCard } from "./ProjectOverviewCard";
import { ProjectProgressChart } from "./ProjectProgressChart";
import { ProjectTasksPanel } from "./ProjectTasksPanel";
import { ProjectTagsCard } from "./ProjectTagsCard";
import { ProjectLinksCard } from "./ProjectLinksCard";
import { ProjectSessionsPanel } from "./ProjectSessionsPanel";
import { ProjectNotesPanel } from "./ProjectNotesPanel";

const EVENT_ICON: Record<ProjectEventKind, typeof CheckCircle2> = {
  session_completed: PlayCircle,
  task_added: ClipboardList,
  task_completed: CheckCircle2,
  note_added: StickyNote,
  note_updated: PencilLine,
  project_updated: FileText,
};

const EVENT_LABEL: Record<ProjectEventKind, string> = {
  session_completed: "Focus session completed",
  task_added: "Task added",
  task_completed: "Task completed",
  note_added: "Note added",
  note_updated: "Note updated",
  project_updated: "Project updated",
};

const EVENT_ICON_COLOR: Record<ProjectEventKind, string> = {
  session_completed: "text-brand-purple",
  task_added: "text-text-secondary",
  task_completed: "text-accent-green",
  note_added: "text-accent-yellow",
  note_updated: "text-accent-yellow",
  project_updated: "text-text-secondary",
};

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId)
  );
  const sessionLog = useFocusStore((s) => s.sessionLog);
  const stats = useProjectStats(projectId ?? "");
  const [tab, setTab] = useState<DetailTab>("overview");
  const [editing, setEditing] = useState(false);
  const [logTimeOpen, setLogTimeOpen] = useState(false);

  const focusBreakdown = useMemo(() => {
    if (!project) return [] as { category: ActivityCategory; percent: number; minutes: number }[];
    const byCat = new Map<ActivityCategory, number>();
    for (const { session } of sessionLog) {
      if (session.projectId !== project.id) continue;
      const minutes = session.actualDurationSec / 60;
      byCat.set(
        session.activityCategory,
        (byCat.get(session.activityCategory) ?? 0) + minutes
      );
    }
    // Fold the project's own manualEntries into its activity category so the
    // donut reflects seed data even when no live sessions exist yet.
    const manualMinutes = (project.manualEntries ?? []).reduce(
      (sum, m) => sum + m.minutes,
      0
    );
    if (manualMinutes > 0) {
      byCat.set(
        project.activityCategory,
        (byCat.get(project.activityCategory) ?? 0) + manualMinutes
      );
    }
    const total = Array.from(byCat.values()).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Array.from(byCat.entries())
      .map(([category, minutes]) => ({
        category,
        minutes: Math.round(minutes),
        percent: minutes / total,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [project, sessionLog]);

  const activityEntries = useMemo(() => {
    if (!project) return [];
    type Entry = {
      id: string;
      kind: ProjectEventKind;
      title: string;
      at: number;
    };
    const fromEvents: Entry[] = (project.events ?? []).map((e) => ({
      id: e.id,
      kind: e.kind,
      title: e.title,
      at: e.at,
    }));
    const fromSessions: Entry[] = sessionLog
      .filter((e) => e.session.projectId === project.id)
      .map((e) => ({
        id: `session-${e.session.id}`,
        kind: "session_completed" as const,
        title: e.session.task || e.session.project,
        at: e.session.endedAt,
      }));
    return [...fromEvents, ...fromSessions]
      .sort((a, b) => b.at - a.at)
      .slice(0, 8);
  }, [project, sessionLog]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const totalDonutMinutes = focusBreakdown.reduce(
    (sum, s) => sum + s.minutes,
    0
  );

  const renderMain = () => {
    switch (tab) {
      case "tasks":
        return <ProjectTasksPanel project={project} />;
      case "resources":
        return <ProjectLinksCard project={project} />;
      case "notes":
        return <ProjectNotesPanel project={project} />;
      case "sessions":
        return <ProjectSessionsPanel project={project} />;
      case "activity":
        return <ActivityFeedCard entries={activityEntries} fullWidth />;
      case "overview":
      default:
        return (
          <>
            <ProjectOverviewCard project={project} stats={stats} />
            <ProjectProgressChart project={project} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 flex flex-col gap-5">
                <ProjectTasksPanel project={project} />
                <ProjectSessionsPanel project={project} limit={4} />
              </div>
              <div className="flex flex-col gap-5">
                <ProjectTagsCard project={project} />
                <ProjectLinksCard project={project} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <main className="flex flex-col gap-5 p-6 min-w-0 overflow-y-auto scrollbar-thin">
        <ProjectHero
          project={project}
          onEdit={() => setEditing(true)}
          onLogTime={() => setLogTimeOpen(true)}
        />
        <ProjectTabs active={tab} onChange={setTab} />
        {renderMain()}
      </main>

      <aside className="hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
        <Card>
          <CardHeader
            title="Focus Time Breakdown"
            trailing={
              <span className="text-[11px] text-text-muted uppercase tracking-wider">
                All time
              </span>
            }
          />
          {focusBreakdown.length === 0 ? (
            <div className="mt-4 text-sm text-text-muted text-center py-6">
              No focus data yet.
            </div>
          ) : (
            <>
              <div className="mt-4 max-w-[200px] mx-auto">
                <CategoryDonut
                  slices={focusBreakdown.map((s) => ({
                    category: s.category,
                    percent: s.percent,
                    minutes: s.minutes,
                  }))}
                  centerLabel={formatHM(totalDonutMinutes)}
                  centerSub="Total"
                  size={168}
                  thickness={18}
                />
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {focusBreakdown.map((slice) => {
                  const meta = ACTIVITY_CATEGORIES[slice.category];
                  return (
                    <li
                      key={slice.category}
                      className="flex items-center gap-2.5 text-xs"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: meta.color }}
                      />
                      <span className="text-text-primary font-medium flex-1 truncate">
                        {meta.label}
                      </span>
                      <span className="text-text-secondary tabular-nums">
                        {formatHM(slice.minutes)}
                      </span>
                      <span className="text-text-muted tabular-nums w-10 text-right">
                        {Math.round(slice.percent * 100)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>

        <ActivityFeedCard entries={activityEntries} />

        <ProjectNotesPanel
          project={project}
          compact
          limit={2}
          onViewAll={() => setTab("notes")}
        />
      </aside>

      {editing && (
        <ProjectFormModal
          open={editing}
          onClose={() => setEditing(false)}
          existing={project}
        />
      )}
      {logTimeOpen && (
        <LogManualTimeModal
          open={logTimeOpen}
          onClose={() => setLogTimeOpen(false)}
          project={project}
        />
      )}
    </>
  );
}

function ActivityFeedCard({
  entries,
  fullWidth,
}: {
  entries: { id: string; kind: ProjectEventKind; title: string; at: number }[];
  fullWidth?: boolean;
}) {
  return (
    <Card>
      <CardHeader title="Recent Activity" />
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">No activity yet.</p>
      ) : (
        <ul className={`mt-3 flex flex-col ${fullWidth ? "gap-2" : ""}`}>
          {entries.map((entry) => {
            const Icon = EVENT_ICON[entry.kind];
            return (
              <li
                key={entry.id}
                className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-bg-cardHover"
              >
                <span
                  className={`w-7 h-7 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0 ${EVENT_ICON_COLOR[entry.kind]}`}
                >
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-text-muted">
                    {EVENT_LABEL[entry.kind]}
                  </div>
                  <div className="text-sm text-text-primary truncate">
                    {entry.title}
                  </div>
                </div>
                <span className="text-[11px] text-text-muted shrink-0 mt-0.5 tabular-nums">
                  {formatRelativeDate(entry.at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
