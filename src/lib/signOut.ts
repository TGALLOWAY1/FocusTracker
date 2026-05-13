import { supabase } from "./supabase";
import { clearAllScopedStorage } from "./userScopedStorage";

export async function signOutAndClear(): Promise<void> {
  await supabase.auth.signOut();
  clearAllScopedStorage();
}
