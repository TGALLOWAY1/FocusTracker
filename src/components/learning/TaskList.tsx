import { useState, type FormEvent } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import type { LearningTask } from "../../data/learningPath";
import { useLearningStore } from "../../state/learningStore";
import { newId } from "../../utils/id";

type Props = {
  subtopicId: string;
  tasks: LearningTask[];
};

export function TaskList({ subtopicId, tasks }: Props) {
  const addTask = useLearningStore((s) => s.addTask);
  const toggleTask = useLearningStore((s) => s.toggleTask);
  const removeTask = useLearningStore((s) => s.removeTask);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(subtopicId, {
      id: newId("task"),
      title: newTaskTitle.trim(),
      completed: false,
    });
    setNewTaskTitle("");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-start gap-3 rounded-xl bg-bg-card border border-border-subtle p-3 hover:border-brand-purple/50 transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleTask(subtopicId, task.id)}
              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                task.completed
                  ? "bg-brand-purple border-brand-purple text-white"
                  : "bg-transparent border-border-subtle text-transparent hover:border-brand-purple/50"
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </button>
            <span
              className={`flex-1 text-sm ${
                task.completed ? "text-text-muted line-through" : "text-text-primary"
              }`}
            >
              {task.title}
            </span>
            <button
              type="button"
              onClick={() => removeTask(subtopicId, task.id)}
              className="text-text-muted hover:text-accent-red transition-colors opacity-0 group-hover:opacity-100"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-border-subtle p-6 text-sm text-text-muted text-center">
          No tasks yet. Create one below.
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-auto flex items-center gap-2 rounded-xl bg-bg-card border border-border-subtle px-3 py-2"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:text-brand-purple hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Add task"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
