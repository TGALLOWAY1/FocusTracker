import { useState, type FormEvent } from "react";
import { Check, Circle, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { useProjectStore } from "../../../state/projectStore";
import type { Project, ProjectTask } from "../../../data/projects";

type Props = {
  project: Project;
};

type DueTone = "today" | "tomorrow" | "overdue" | "upcoming";

function dueDateLabel(
  iso: string | undefined
): { label: string; tone: DueTone } | null {
  if (!iso) return null;
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays < 0) return { label: "Overdue", tone: "overdue" };
  if (diffDays === 0) return { label: "Today", tone: "today" };
  if (diffDays === 1) return { label: "Tomorrow", tone: "tomorrow" };
  return {
    label: due.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    tone: "upcoming",
  };
}

const TONE_CLASS: Record<DueTone, string> = {
  today: "bg-accent-greenSoft text-accent-green",
  tomorrow: "bg-brand-purpleSoft text-brand-purple",
  overdue: "bg-accent-orangeSoft text-accent-orange",
  upcoming: "bg-bg-elevated text-text-secondary border border-border-subtle",
};

export function ProjectTasksPanel({ project }: Props) {
  const tasks = project.tasks ?? [];
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length === 0 ? 0 : completedCount / tasks.length;
  const addTask = useProjectStore((s) => s.addTask);
  const toggleTask = useProjectStore((s) => s.toggleTask);
  const removeTask = useProjectStore((s) => s.removeTask);

  const [draft, setDraft] = useState("");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    addTask(project.id, { title });
    setDraft("");
  };

  return (
    <Card>
      <CardHeader
        title="Tasks"
        trailing={
          <span className="text-[11px] uppercase tracking-wider text-text-muted">
            {tasks.length === 0
              ? "Get started"
              : `${completedCount} / ${tasks.length} completed`}
          </span>
        }
      />
      {tasks.length > 0 && (
        <div className="mt-3 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className="h-full bg-brand-purple transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-subtle bg-bg-elevated/40 p-5 text-center">
          <p className="text-sm text-text-secondary">No tasks yet.</p>
          <p className="mt-1 text-xs text-text-muted">
            Break this project into actionable steps.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border-subtle">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleTask(project.id, task.id)}
              onRemove={() => removeTask(project.id, task.id)}
            />
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-4 flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated/60 pl-3 pr-1 py-1"
      >
        <Plus size={16} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none py-2"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="px-3 h-8 rounded-lg text-xs font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
        >
          Add Task
        </button>
      </form>
    </Card>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: ProjectTask;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const due = dueDateLabel(task.dueDate);
  return (
    <li className="flex items-center gap-3 py-2.5 group">
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          task.completed
            ? "bg-accent-green text-bg-base"
            : "border border-border-strong text-transparent hover:border-brand-purple"
        }`}
      >
        {task.completed ? <Check size={14} strokeWidth={3} /> : <Circle size={10} />}
      </button>
      <span
        className={`flex-1 text-sm ${
          task.completed
            ? "text-text-muted line-through"
            : "text-text-primary"
        }`}
      >
        {task.title}
      </span>
      {task.category && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle">
          {task.category}
        </span>
      )}
      {due && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${TONE_CLASS[due.tone]}`}
        >
          {due.label}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove task"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-bg-cardHover opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}
