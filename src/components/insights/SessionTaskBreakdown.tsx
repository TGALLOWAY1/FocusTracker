import { useState } from "react";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";
import { useFocusStore, type TaskRecord } from "../../state/focusStore";
import { TASK_TAG_PRESETS } from "../../data/taskTags";

function TaskRecordRow({
  sessionId,
  record,
}: {
  sessionId: string;
  record: TaskRecord;
}) {
  const updateTaskRecord = useFocusStore((s) => s.updateTaskRecord);
  const [minutes, setMinutes] = useState(
    record.durationSec == null
      ? ""
      : String(Math.round(record.durationSec / 60))
  );
  const [editingTag, setEditingTag] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const checkedOff = record.completedAt != null;

  const commitMinutes = () => {
    const trimmed = minutes.trim();
    if (trimmed === "") {
      updateTaskRecord(sessionId, record.id, { durationSec: null });
      return;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) {
      setMinutes(
        record.durationSec == null
          ? ""
          : String(Math.round(record.durationSec / 60))
      );
      return;
    }
    const rounded = Math.round(n);
    setMinutes(String(rounded));
    updateTaskRecord(sessionId, record.id, { durationSec: rounded * 60 });
  };

  const applyTag = (tag: string | null) => {
    updateTaskRecord(sessionId, record.id, { tag });
    setEditingTag(false);
    setCustomTag("");
  };

  const submitCustom = () => {
    const t = customTag.trim();
    if (t) applyTag(t);
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-3">
      <div className="flex items-center gap-2.5">
        {checkedOff ? (
          <CheckCircle2 size={15} className="text-accent-green shrink-0" />
        ) : (
          <Circle size={15} className="text-text-muted shrink-0" />
        )}
        <span className="flex-1 min-w-0 truncate text-sm text-text-primary">
          {record.text}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onBlur={commitMinutes}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            placeholder="—"
            aria-label={`Minutes for ${record.text}`}
            className="w-14 bg-bg-card border border-border-subtle rounded-md px-2 py-1 text-xs text-text-primary text-right tabular-nums outline-none focus:border-brand-purple/50 transition-colors"
          />
          <span className="text-[11px] text-text-muted">min</span>
        </div>
      </div>

      <div className="mt-2 pl-[26px]">
        {editingTag ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {TASK_TAG_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyTag(preset)}
                  className={[
                    "px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors",
                    record.tag === preset
                      ? "bg-brand-purpleSoft text-brand-purple border-brand-purple/35"
                      : "bg-bg-card text-text-secondary border-border-subtle hover:text-text-primary",
                  ].join(" ")}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitCustom();
                  }
                }}
                placeholder="Custom tag…"
                className="flex-1 bg-bg-card border border-border-subtle rounded-md px-2 py-1 text-xs text-text-primary placeholder-text-muted outline-none focus:border-brand-purple/50 transition-colors"
              />
              <button
                type="button"
                onClick={submitCustom}
                disabled={!customTag.trim()}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-brand-purple text-white disabled:opacity-40 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTag(false);
                  setCustomTag("");
                }}
                className="px-2 py-1 rounded-md text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : record.tag ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-purpleSoft text-brand-purple">
            {record.tag}
            <button
              type="button"
              onClick={() => setEditingTag(true)}
              className="text-brand-purple/70 hover:text-brand-purple underline"
            >
              edit
            </button>
            <button
              type="button"
              onClick={() => applyTag(null)}
              aria-label="Remove tag"
              className="text-brand-purple/70 hover:text-brand-purple"
            >
              <X size={11} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setEditingTag(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-card border border-dashed border-border-strong text-text-muted hover:text-text-primary transition-colors"
          >
            <Plus size={11} />
            Add tag
          </button>
        )}
      </div>
    </div>
  );
}

export function SessionTaskBreakdown({
  sessionId,
  records,
}: {
  sessionId: string;
  records: TaskRecord[];
}) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {records.map((record) => (
        <TaskRecordRow
          key={record.id}
          sessionId={sessionId}
          record={record}
        />
      ))}
    </div>
  );
}
