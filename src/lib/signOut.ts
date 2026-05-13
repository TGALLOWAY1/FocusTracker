import { supabase } from "./supabase";

const LEGACY_STORAGE_KEYS = [
  "focus-ladder.focus",
  "focus-ladder.projects",
  "focus-ladder.learning",
  "focus-ladder.ideas",
];

export async function signOutAndClear(): Promise<void> {
  await supabase.auth.signOut();
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage access errors (private mode, quota) are non-fatal for sign-out.
    }
  }
  // Per-user keyed stores (focus-ladder.*.${userId}) land in M2+; clear them here too once they exist.
}
