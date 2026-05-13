import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type SessionState =
  | { status: "loading"; session: null }
  | { status: "authed"; session: Session }
  | { status: "anon"; session: null };

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading", session: null });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState(
        data.session
          ? { status: "authed", session: data.session }
          : { status: "anon", session: null }
      );
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(
        session
          ? { status: "authed", session }
          : { status: "anon", session: null }
      );
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
