import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import { useFocusStore, type Todo } from "../../state/focusStore";
import { useProjectStore } from "../../state/projectStore";
import {
  PROJECT_ICONS,
  projectColorClasses,
  type Project,
} from "../../data/projects";

import { newId } from "../../utils/id";

type PlanMyDayModalProps = {
  open: boolean;
  onClose: () => void;
};

const DURATION_OPTIONS = [0, 15, 30, 45, 60, 90, 120];

function FieldLabel({
  children,
  optional,
}: {
  children: string;
  optional?: boolean;
}) {
  return (
    <Eyebrow className="mb-2">
      {children}
      {optional && (
        <span className="ml-1.5 text-text-muted/70 normal-case tracking-normal">
          (optional)
        </span>
      )}
    </Eyebrow>
  );
}

function ProjectPill({
  project,
  selected,
  onClick,
}: {
  project: Project;
  selected: boolean;
  onClick: () => void;
}) {
  const colors = projectColorClasses(project.color);
  const Icon = PROJECT_ICONS[project.iconKey];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left",
        selected
          ? "border-brand-purple/45 bg-brand-purpleSoft text-text-primary"
          : "border-border-subtle bg-bg-elevated text-text-secondary hover:text-text-primary hover:border-border-strong",
      ].join(" ")}
    >
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.iconBg}`}
      >
        <Icon size={14} className={colors.iconColor} strokeWidth={2} />
      </span>
      <span className="truncate">{project.name}</span>
    </button>
  );
}

export function PlanMyDayModal({ open, onClose }: PlanMyDayModalProps) {
  const storeProjectId = useFocusStore((s) => s.projectId);
  const storeTask = useFocusStore((s) => s.task);
  const storeTodos = useFocusStore((s) => s.todos);
  const storeDuration = useFocusStore((s) => s.durationSec);
  const setDailyPlan = useFocusStore((s) => s.setDailyPlan);
  const projects = useProjectStore((s) => s.projects);

  const defaultProjectId =
    projects.find((p) => p.id === storeProjectId)?.id ??
    projects[0]?.id ??
    "";
  const defaultDurationMin = Math.round(storeDuration / 60);

  const [projectId, setProjectId] = useState<string>(defaultProjectId);
  const [primary, setPrimary] = useState<string>(storeTask);
  const [todos, setTodos] = useState<Todo[]>(storeTodos);
  const [newTodo, setNewTodo] = useState("");
  const [durationMin, setDurationMin] = useState<number>(defaultDurationMin);
  const primaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setProjectId(defaultProjectId);
    setPrimary(storeTask);
    setTodos(storeTodos);
    setNewTodo("");
    setDurationMin(defaultDurationMin);
    requestAnimationFrame(() => primaryInputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedProject = projects.find((p) => p.id === projectId);
  const canSubmit = !!selectedProject && primary.trim().length > 0;

  const submit = () => {
    if (!canSubmit || !selectedProject) return;
    setDailyPlan({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      primaryTask: primary.trim(),
      todos,
      plannedDurationMin: durationMin,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Plan My Day"
      description="Pick the one thing that matters most today, then commit to it."
      size="md"
    >
      <div className="flex flex-col gap-5">
        <div>
          <FieldLabel>Project</FieldLabel>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
            {projects.map((p) => (
              <ProjectPill
                key={p.id}
                project={p}
                selected={projectId === p.id}
                onClick={() => setProjectId(p.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Primary focus target</FieldLabel>
          <input
            ref={primaryInputRef}
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="What's the one thing?"
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-purple/50 transition-colors"
          />
        </div>

        <div>
          <FieldLabel optional>To-do list</FieldLabel>
          <div className="flex flex-col gap-2">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-2 px-3 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary">
                <span className="flex-1">{todo.text}</span>
                <button
                  type="button"
                  onClick={() => setTodos(todos.filter((t) => t.id !== todo.id))}
                  className="text-text-muted hover:text-accent-red"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTodo.trim()) {
                    e.preventDefault();
                    setTodos([...todos, { id: newId("todo"), text: newTodo.trim(), done: false }]);
                    setNewTodo("");
                  }
                }}
                placeholder="Add a to-do item..."
                className="flex-1 bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-purple/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTodo.trim()) {
                    setTodos([...todos, { id: newId("todo"), text: newTodo.trim(), done: false }]);
                    setNewTodo("");
                  }
                }}
                disabled={!newTodo.trim()}
                className="px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Planned session duration</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((min) => {
              const active = durationMin === min;
              return (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDurationMin(min)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors tabular-nums",
                    active
                      ? "bg-brand-purpleSoft text-brand-purple border-brand-purple/35"
                      : "bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary",
                  ].join(" ")}
                >
                  {min === 0 ? "Open-ended" : `${min} min`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/70">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles size={14} />
            Save Plan
          </button>
        </div>
      </div>
    </Modal>
  );
}
