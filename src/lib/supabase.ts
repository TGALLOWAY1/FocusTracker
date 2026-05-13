import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// In a browser without env vars, fail fast at module load so the developer
// gets a clear message instead of a confusing network error later. In node
// (tests), stay quiet and hand back a proxy that throws only if used.
if (typeof window !== "undefined" && !supabaseConfigured) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values."
  );
}

function makeUnconfiguredClient(): SupabaseClient {
  const err = new Error(
    "Supabase client accessed before configuration. Check supabaseConfigured before calling repos."
  );
  return new Proxy({} as SupabaseClient, {
    get() {
      throw err;
    },
  });
}

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : makeUnconfiguredClient();
