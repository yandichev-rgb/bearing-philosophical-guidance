import { createFileRoute, Link } from "@tanstack/react-router";

import { Seal, Wordmark } from "@/components/Seal";

const title = "Membership confirmed · Bearing";
const description = "Your Bearing membership is being confirmed.";

export const Route = createFileRoute("/membership/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
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
  component: MembershipReturn,
});

function MembershipReturn() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <div className="paper grain min-h-screen">
      <header className="border-b border-ink/25">
        <div className="shell flex h-[68px] items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Bearing home">
            <Seal size={32} className="shrink-0" />
            <Wordmark />
          </Link>
        </div>
      </header>

      <main className="shell max-w-2xl py-20">
        <p className="label text-oxblood">Membership</p>
        {sessionId ? (
          <>
            <h1 className="display-lg mt-6 text-ink">The Lyceum is open to you.</h1>
            <p className="mt-6 leading-relaxed text-ink-soft">
              Your payment went through. It can take a moment for the membership to register, so
              refresh the membership page if it still shows as inactive.
            </p>
          </>
        ) : (
          <>
            <h1 className="display-lg mt-6 text-ink">Nothing to confirm here.</h1>
            <p className="mt-6 leading-relaxed text-ink-soft">
              We could not find a payment to confirm. Start again from the membership page.
            </p>
          </>
        )}
        <div className="mt-10 flex flex-wrap gap-6">
          <Link to="/" className="btn-ink">
            Bring a question
          </Link>
          <Link to="/membership" className="link-underline">
            Membership
          </Link>
        </div>
      </main>
    </div>
  );
}
