import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { listMyReadings, myReadingCosts } from "@/lib/readings.functions";
import { readingHeading } from "@/lib/reading-heading";
import { PageFrame, Sheet } from "@/components/PageFrame";
import { Reveal } from "@/components/Reveal";
import { ReadingFollowUps } from "@/components/ReadingFollowUps";
import { useMembership } from "@/hooks/useMembership";

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

function Readings() {
  const { session, loading } = useAuth();
  const { isMember } = useMembership();
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
    <PageFrame
      folio="Fol. III · Your readings"
      actions={
        session ? (
          <button type="button" className="nav-link" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        ) : (
          <Link to="/auth" className="nav-link">
            Sign in
          </Link>
        )
      }
    >
      <div className="shell max-w-3xl py-16 lg:py-20">
        <Reveal>
          <p className="label text-oxblood">Your readings</p>

          {!session && !loading ? (
            <>
              <h1 className="display-lg mt-6 text-ink">Sign in to see your readings.</h1>
              <p className="mt-6 leading-relaxed text-ink-soft">
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
                  {costs.readings} reading{costs.readings === 1 ? "" : "s"} generated · estimated
                  cost ${costs.totalUsd.toFixed(4)}
                </p>
              ) : null}
            </>
          )}
        </Reveal>

        {session ? (
          isLoading ? (
            <p className="label mt-12 text-ink-soft">Gathering your readings.</p>
          ) : (data?.length ?? 0) === 0 ? (
            <Reveal delay={0.08} className="mt-12">
              <Sheet>
                <p className="leading-relaxed text-ink-soft">
                  Nothing saved yet. Bring a question on the home page and save the reading it
                  returns.
                </p>
                <p className="mt-7">
                  <Link to="/" className="btn-ink">
                    Bring a question
                  </Link>
                </p>
              </Sheet>
            </Reveal>
          ) : (
            <ul className="mt-12 space-y-8">
              {data?.map((reading, i) => (
                <Reveal as="li" key={reading.id} delay={Math.min(i, 4) * 0.05}>
                  <Sheet>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="label text-oxblood">
                        {readingHeading(reading.philosopher_slug)}
                      </p>
                      <span className="folio shrink-0">
                        No. {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2
                      className="mt-3 text-2xl leading-snug text-ink"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {reading.headline}
                    </h2>
                    <p className="mt-5 border-t border-ink/15 pt-5 leading-relaxed text-ink-soft">
                      {reading.exercise}
                    </p>
                    <p className="mt-5 text-lg italic leading-snug text-ink">{reading.question}</p>
                    <ReadingFollowUps readingId={reading.id} isMember={isMember} />
                  </Sheet>
                </Reveal>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </PageFrame>
  );
}
