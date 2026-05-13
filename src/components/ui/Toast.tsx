import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ToastKind = "error" | "info";

type ToastInput = {
  message: string;
  kind?: ToastKind;
  durationMs?: number;
  action?: { label: string; onClick: () => void | Promise<void> };
};

type Toast = ToastInput & { id: number; kind: ToastKind };

type ToastContextValue = {
  show: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>((input) => {
    const id = ++idRef.current;
    const toast: Toast = { id, kind: input.kind ?? "info", ...input };
    setToasts((list) => [...list, toast]);
    const duration = input.durationMs ?? 5000;
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const borderClass =
    toast.kind === "error" ? "border-accent-red/40" : "border-border-subtle";
  const dotClass =
    toast.kind === "error" ? "bg-accent-red" : "bg-brand-purple";
  return (
    <div
      role="status"
      className={`bg-bg-card border ${borderClass} rounded-xl shadow-2xl shadow-black/40 p-3 pr-2 flex items-start gap-3 animate-[toastSlide_180ms_ease-out]`}
    >
      <span className={`mt-1.5 w-2 h-2 rounded-full ${dotClass} shrink-0`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{toast.message}</p>
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-medium text-brand-purple hover:text-text-primary transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
      >
        <X size={14} />
      </button>
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

// Module-level access for non-component callers (e.g., store actions).
// Set by <ToastProvider> on mount; falls back to console.error if no provider is mounted.
let bridgeShow: ToastContextValue["show"] | null = null;

export function _bindToastBridge(show: ToastContextValue["show"]) {
  bridgeShow = show;
}

export function toast(input: ToastInput) {
  if (bridgeShow) {
    bridgeShow(input);
  } else if (input.kind === "error") {
    console.error("[toast:error]", input.message);
  } else {
    console.info("[toast]", input.message);
  }
}

export function ToastBridge() {
  const { show } = useToast();
  useEffect(() => {
    _bindToastBridge(show);
    return () => {
      _bindToastBridge(() => {});
    };
  }, [show]);
  return null;
}
