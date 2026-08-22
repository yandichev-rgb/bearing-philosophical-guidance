import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Seal, Wordmark } from "@/components/Seal";

const title = "Sign in · Bearing";
const description = "Sign in to keep your inquiries and your readings in one place.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (session) navigate({ to: "/readings" });
  }, [session, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.invalidate();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/readings` },
      });
      setMessage(error ? error.message : "Check your email to confirm your account.");
    }
    setBusy(false);
  };

  const google = async () => {
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setMessage("Google sign in did not complete.");
      return;
    }
    if (result.redirected) return;
    router.invalidate();
  };

  return (
    <div className="paper grain flex min-h-screen flex-col">
      <header className="border-b border-ink/25">
        <div className="shell flex h-[68px] items-center">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Bearing home">
            <Seal size={32} className="shrink-0" />
            <Wordmark />
          </Link>
        </div>
      </header>

      <main className="shell flex max-w-md flex-1 flex-col justify-center py-16">
        <p className="label text-ink-soft">{mode === "signin" ? "Sign in" : "Create account"}</p>
        <h1 className="display-lg mt-5 text-ink">
          {mode === "signin" ? "Return to your readings." : "Keep your readings."}
        </h1>

        <form onSubmit={submit} className="mt-9 space-y-5">
          <label className="block">
            <span className="label block text-ink-soft">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border border-ink/40 bg-papyrus-light/70 p-3 text-ink"
            />
          </label>
          <label className="block">
            <span className="label block text-ink-soft">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border border-ink/40 bg-papyrus-light/70 p-3 text-ink"
            />
          </label>
          <button type="submit" disabled={busy} className="btn-ink w-full">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button type="button" onClick={google} className="btn-outline-ink mt-4 w-full">
          Continue with Google
        </button>

        {message ? (
          <p className="mt-5 text-sm text-oxblood" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          className="link-underline mt-9 self-start"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create an account" : "I already have an account"}
        </button>
      </main>
    </div>
  );
}
