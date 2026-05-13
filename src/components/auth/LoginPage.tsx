import { useState, type FormEvent } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Card } from "../ui/Card";

type Mode = "signin" | "signup";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setInfo("Magic link sent. Check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send magic link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <Card className="w-full max-w-sm">
        <header className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            Focus Ladder
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            {mode === "signin" ? "Sign in to your account." : "Create an account."}
          </p>
        </header>

        <form className="space-y-3" onSubmit={submit}>
          <Field
            icon={<Mail size={14} />}
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            icon={<Lock size={14} />}
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
          />

          {error && <p className="text-xs text-accent-red">{error}</p>}
          {info && <p className="text-xs text-accent-green">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-10 rounded-lg bg-brand-purple text-white text-sm font-medium hover:bg-brand-purpleDeep disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-text-muted">
          <span className="flex-1 h-px bg-border-subtle" aria-hidden="true" />
          or
          <span className="flex-1 h-px bg-border-subtle" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={sendMagicLink}
          disabled={busy}
          className="w-full h-10 rounded-lg border border-border-subtle text-text-primary text-sm font-medium hover:bg-bg-elevated disabled:opacity-60 transition-colors"
        >
          Email me a magic link
        </button>

        <p className="mt-5 text-center text-xs text-text-muted">
          {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="text-brand-purple hover:text-text-primary transition-colors"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </Card>
    </div>
  );
}

type FieldProps = {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2 h-10 rounded-lg bg-bg-elevated border border-border-subtle focus-within:border-brand-purple transition-colors px-3">
        <span className="text-text-muted">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>
    </label>
  );
}
