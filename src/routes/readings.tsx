import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { listMyReadings, myReadingCosts } from "@/lib/readings.functions";
import { readingHeading } from "@/lib/reading-heading";
import { Seal, Wordmark } from "@/components/Seal";
import { philosophers } from "@/data/philosophers";

const title = "Your readings · Bearing";
const description = "The inquiries you have brought to Bearing and the readings you saved.";

export const Route = createFileRoute("/readings")({
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
  component: Readings,
});

function nameFor(slug: string) {
  return philosophers.find((p) => p.slug === slug)?.name ?? slug;
}

function Readings() {
  const { session, loading } = useAuth();
  const fetchReadings = useServerFn(listMyReadings);
  const fetchCosts = useServerFn(myReadingCosts);
  const { data: costs } = useQuery({
    queryKey: ["reading-costs"],
    queryFn: () => fetchCosts(),
    enabled: Boolean(session),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["readings"],
    queryFn: () => fetchReadings(),
    enabled: Boolean(session),
  });

  return (
    <div className="paper grain min-h-screen">
      <header className="border-b border-ink/25">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Bearing home">
            <Seal size={32} className="shrink-0" />
            <Wordmark />
          </Link>
          {session ? (
            <button
              type="button"
              className="nav-link"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      <main className="shell max-w-3xl py-16">
        <p className="label text-ink-soft">Your readings</p>

        {!session && !loading ? (
          <>
            <h1 className="display-lg mt-6 text-ink">Sign in to see your readings.</h1>
            <p className="mt-6 text-ink-soft">
              Your inquiries stay attached to your own account and nobody else can read them.
            </p>
            <p className="mt-8">
              <Link to="/auth" className="btn-ink">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="display-lg mt-6 text-ink">What you have brought here.</h1>
            {costs && costs.readings > 0 ? (
              <p className="label mt-6 text-ink-soft">
                {costs.readings} reading{costs.readings === 1 ? "" : "s"} generated · estimated cost
                ${costs.totalUsd.toFixed(4)}
              </p>
            ) : null}
            {isLoading ? (
              <p className="label mt-10 text-ink-soft">Gathering your readings.</p>
            ) : (data?.length ?? 0) === 0 ? (
              <p className="mt-10 text-ink-soft">
                Nothing saved yet. Start an inquiry on the home page and save the reading.
              </p>
            ) : (
              <ul className="mt-10 border-t border-ink/25">
                {data?.map((reading) => (
                  <li key={reading.id} className="border-b border-ink/20 py-8">
                    <p className="label text-oxblood">{readingHeading(reading.philosopher_slug)}</p>
                    <h2 className="mt-3 text-2xl text-ink">{reading.headline}</h2>
                    <p className="mt-4 leading-relaxed text-ink-soft">{reading.exercise}</p>
                    <p className="mt-4 text-lg italic text-ink">{reading.question}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
