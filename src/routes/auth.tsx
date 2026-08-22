import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { PageFrame, Sheet } from "@/components/PageFrame";
import { Reveal } from "@/components/Reveal";

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
        options: { emailRedirectTo: publicSiteUrl("/readings") },
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
    <PageFrame folio="Fol. I · Entry">
      <div className="shell grid max-w-5xl gap-12 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
        <Reveal>
          <p className="label text-oxblood">{mode === "signin" ? "Sign in" : "Create account"}</p>
          <h1 className="display-lg mt-5 text-ink">
            {mode === "signin" ? "Return to your readings." : "Keep your readings."}
          </h1>
          <p className="mt-6 max-w-sm leading-relaxed text-ink-soft">
            An account holds the questions you have brought here and the readings written for them.
            Only you can read them.
          </p>
          <p className="mt-8 max-w-sm border-l border-oxblood pl-5 italic leading-relaxed text-ink">
            Clear thinking for real life.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <Sheet>
            <form onSubmit={submit} className="space-y-5">
              <label className="block">
                <span className="label block text-ink-soft">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full border border-ink/40 bg-papyrus/50 p-3 text-ink focus:border-oxblood focus:outline-none"
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
                  className="mt-2 w-full border border-ink/40 bg-papyrus/50 p-3 text-ink focus:border-oxblood focus:outline-none"
                />
              </label>
              <button type="submit" disabled={busy} className="btn-ink w-full">
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-ink/20" />
              <span className="folio">or</span>
              <span className="h-px flex-1 bg-ink/20" />
            </div>

            <button type="button" onClick={google} className="btn-outline-ink w-full">
              Continue with Google
            </button>

            {message ? (
              <p className="mt-5 text-sm text-oxblood" role="status">
                {message}
              </p>
            ) : null}

            <button
              type="button"
              className="link-underline mt-8"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "I already have an account"}
            </button>
          </Sheet>
        </Reveal>
      </div>
    </PageFrame>
  );
}
