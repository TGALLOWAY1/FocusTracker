import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useSession } from "../../lib/useSession";
import { LoginPage } from "./LoginPage";

export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const state = useSession();

  if (state.status === "loading") {
    return <FullScreenStatus label="Loading…" />;
  }
  if (state.status === "anon") {
    return <LoginPage />;
  }
  return <>{children(state.session)}</>;
}

function FullScreenStatus({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-secondary">
      <div className="flex items-center gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-brand-purple animate-pulse" aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
