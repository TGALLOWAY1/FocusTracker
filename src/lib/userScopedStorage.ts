import type { StateStorage } from "zustand/middleware";

// Reads the supabase-js auth token directly from localStorage so we can
// route persist writes into a per-user key BEFORE the auth client has
// finished any async init. supabase-js v2 stores the session as JSON under
// `sb-${projectRef}-auth-token`; we lean on that format here. If it ever
// changes, userScopedLocalStorage will silently fall back to no-op (the
// store will boot with in-code defaults and HydrationGate's server fetch
// will replace them).

function projectRef(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return null;
  }
}

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const ref = projectRef();
  if (!ref) return null;
  try {
    const raw = window.localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const id = parsed?.user?.id ?? parsed?.currentSession?.user?.id;
    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}

export const userScopedLocalStorage: StateStorage = {
  getItem(name) {
    if (typeof window === "undefined") return null;
    const uid = currentUserId();
    if (!uid) return null;
    return window.localStorage.getItem(`${name}.${uid}`);
  },
  setItem(name, value) {
    if (typeof window === "undefined") return;
    const uid = currentUserId();
    if (!uid) return;
    window.localStorage.setItem(`${name}.${uid}`, value);
  },
  removeItem(name) {
    if (typeof window === "undefined") return;
    const uid = currentUserId();
    if (!uid) return;
    window.localStorage.removeItem(`${name}.${uid}`);
  },
};

// Helper for sign-out and tests: removes every focus-ladder.* key the
// browser currently has (any user).
export function clearAllScopedStorage(): void {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith("focus-ladder.")) toRemove.push(key);
  }
  for (const key of toRemove) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
