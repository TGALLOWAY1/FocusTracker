import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { sessionRepo } from "../../repos/sessionRepo";
import { useFocusStore } from "../../state/focusStore";
import { toast } from "../ui/Toast";

type Props = {
  session: Session;
  children: ReactNode;
};

type Status = "loading" | "ready";

export function HydrationGate({ session, children }: Props) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // The store was initialized before the user was known, so persist's
        // initial rehydrate read from an unscoped (empty) key. Re-read now
        // that `focus-ladder.focus.${userId}` is reachable.
        await useFocusStore.persist.rehydrate();
        const entries = await sessionRepo.fetchAll();
        if (!active) return;
        useFocusStore.getState()._setSessionLogFromServer(entries);
        setStatus("ready");
      } catch (err) {
        if (!active) return;
        console.error("[HydrationGate] hydration failed", err);
        toast({
          kind: "error",
          message: "Couldn't load your session history. Using local cache.",
        });
        setStatus("ready");
      }
    })();
    return () => {
      active = false;
    };
  }, [session.user.id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-secondary">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full bg-brand-purple animate-pulse"
            aria-hidden="true"
          />
          <span className="text-sm">Loading your sessions…</span>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
