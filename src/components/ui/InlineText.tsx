import { useState, type KeyboardEvent } from "react";

type Variant = "input" | "textarea";

type Props = {
  value: string;
  onChange: (next: string) => void;
  variant?: Variant;
  placeholder?: string;
  className?: string;
  rows?: number;
  ariaLabel?: string;
  monospace?: boolean;
};

export function InlineText({
  value,
  onChange,
  variant = "input",
  placeholder,
  className,
  rows = 3,
  ariaLabel,
  monospace,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEdit() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const next = variant === "input" ? draft.trim() : draft;
    if (next !== value) onChange(next);
  }

  function cancel() {
    setEditing(false);
  }

  function onKeyDown(
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter") {
      if (variant === "input" || e.metaKey || e.ctrlKey) {
        e.preventDefault();
        commit();
      }
    }
  }

  if (editing) {
    const editBase =
      "w-full bg-bg-elevated rounded-md border border-brand-purple/60 px-2 py-1 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30";
    const monoClass = monospace ? "font-mono" : "";
    if (variant === "textarea") {
      return (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={rows}
          aria-label={ariaLabel}
          className={`${className ?? ""} ${editBase} ${monoClass} resize-y`}
        />
      );
    }
    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`${className ?? ""} ${editBase} ${monoClass}`}
      />
    );
  }

  const hasValue = value.length > 0;
  const wrap = variant === "textarea" ? "whitespace-pre-wrap" : "";
  return (
    <button
      type="button"
      onClick={startEdit}
      aria-label={ariaLabel ?? "Edit"}
      title="Click to edit"
      className={`${className ?? ""} block w-full text-left cursor-text rounded-md -mx-1 px-1 hover:bg-bg-cardHover/60 hover:ring-1 hover:ring-border-subtle transition-colors ${wrap}`}
    >
      {hasValue ? (
        value
      ) : (
        <span className="text-text-muted italic font-normal">
          {placeholder ?? "Click to edit"}
        </span>
      )}
    </button>
  );
}
