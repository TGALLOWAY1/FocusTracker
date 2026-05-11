import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: ModalSize;
};

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[modalFade_180ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${SIZE_CLASS[size]} bg-bg-card border border-border-subtle rounded-2xl shadow-2xl shadow-black/40 animate-[modalPop_220ms_cubic-bezier(.2,.8,.2,1)]`}
      >
        <header className="flex items-start justify-between gap-3 p-5 border-b border-border-subtle">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-base font-semibold tracking-tight text-text-primary"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X size={16} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
      <style>{`
        @keyframes modalFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: translateY(-6px) scale(.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
