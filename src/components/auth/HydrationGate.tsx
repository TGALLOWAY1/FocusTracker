import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

type Props = {
  session: Session;
  children: ReactNode;
};

// Passthrough in M1. M2 will fetch server data into stores here before rendering children.
export function HydrationGate({ session, children }: Props) {
  void session;
  return <>{children}</>;
}
