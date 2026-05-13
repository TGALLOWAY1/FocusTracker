import { supabase, supabaseConfigured } from "../lib/supabase";
import { toast } from "../components/ui/Toast";
import type {
  CompletedSession,
  LoggedSession,
  SessionReflection,
} from "../state/focusStore";
import {
  joinRowToLoggedSession,
  reflectionToRow,
  sessionToRow,
  type SessionRow,
  type SessionRowWithReflection,
} from "../state/serialize/sessionSerialize";

async function currentUserId(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function notifyWriteFailure(label: string, retry: () => Promise<void>): void {
  toast({
    kind: "error",
    message: `Couldn't save ${label}. Tap to retry.`,
    action: {
      label: "Retry",
      onClick: () => {
        void retry();
      },
    },
  });
}

export const sessionRepo = {
  async fetchAll(): Promise<LoggedSession[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*, focus_reflections(*)")
      .order("ended_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) =>
      joinRowToLoggedSession(row as SessionRowWithReflection)
    );
  },

  async insert(session: CompletedSession): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    const row = sessionToRow(session, userId);
    const { error } = await supabase.from("focus_sessions").insert(row);
    if (error) {
      notifyWriteFailure("session", () => sessionRepo.insert(session));
      throw error;
    }
  },

  async bulkInsert(sessions: CompletedSession[]): Promise<void> {
    const userId = await currentUserId();
    if (!userId || sessions.length === 0) return;
    const rows = sessions.map((s) => sessionToRow(s, userId));
    const { error } = await supabase.from("focus_sessions").insert(rows);
    if (error) throw error;
  },

  async attachReflection(reflection: SessionReflection): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    const row = reflectionToRow(reflection, userId);
    const { error } = await supabase
      .from("focus_reflections")
      .upsert(row, { onConflict: "session_id" });
    if (error) {
      notifyWriteFailure("reflection", () =>
        sessionRepo.attachReflection(reflection)
      );
      throw error;
    }
  },

  async delete(sessionId: string): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase
      .from("focus_sessions")
      .delete()
      .eq("id", sessionId);
    if (error) throw error;
  },
};

export type SessionRepo = typeof sessionRepo;
export type { SessionRow };
