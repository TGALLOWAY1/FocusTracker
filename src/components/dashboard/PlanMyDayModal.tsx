import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useFocusStore } from "../../state/focusStore";
import {
  ACTIVE_PROJECTS,
  projectColorClasses,
  type Project,
} from "../../data/projects";
import { FOCUS_TIERS } from "../../data/focusTiers";

type PlanMyDayModalProps = {
  open: boolean;
  onClose: () => void;
};

const DURATION_OPTIONS = FOCUS_TIERS.map((t) => t.minutes);

function FieldLabel({
  children,
  optional,
}: {
  children: string;
  optional?: boolean;
}) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-2">
      {children}
      {optional && (
        <span className="ml-1.5 text-text-muted/70 normal-case tracking-normal">
          (optional)
        </span>
      )}
    </div>
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
  const Icon = project.icon;
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
  const storeProject = useFocusStore((s) => s.project);
  const storeTask = useFocusStore((s) => s.task);
  const storeDuration = useFocusStore((s) => s.durationSec);
  const setDailyPlan = useFocusStore((s) => s.setDailyPlan);

  const defaultProjectId =
    ACTIVE_PROJECTS.find((p) => p.name === storeProject)?.id ??
    ACTIVE_PROJECTS[0]?.id ??
    "";
  const defaultDurationMin = Math.round(storeDuration / 60);

  const [projectId, setProjectId] = useState<string>(defaultProjectId);
  const [primary, setPrimary] = useState<string>(storeTask);
  const [secondary, setSecondary] = useState<string>("");
  const [durationMin, setDurationMin] = useState<number>(defaultDurationMin);
  const primaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setProjectId(defaultProjectId);
    setPrimary(storeTask);
    setSecondary("");
    setDurationMin(defaultDurationMin);
    requestAnimationFrame(() => primaryInputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedProject = ACTIVE_PROJECTS.find((p) => p.id === projectId);
  const canSubmit = !!selectedProject && primary.trim().length > 0;

  const submit = () => {
    if (!canSubmit || !selectedProject) return;
    setDailyPlan({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      primaryTask: primary.trim(),
      secondaryTask: secondary.trim() || undefined,
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ACTIVE_PROJECTS.map((p) => (
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
          <FieldLabel optional>Secondary task</FieldLabel>
          <input
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            placeholder="If time permits..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-purple/50 transition-colors"
          />
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
                  {min} min
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
