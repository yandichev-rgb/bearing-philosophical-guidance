import { createFileRoute, Link } from "@tanstack/react-router";

import { PageFrame, Sheet } from "@/components/PageFrame";
import { Reveal } from "@/components/Reveal";

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
    <PageFrame folio="Fol. II · Membership">
      <div className="shell max-w-2xl py-20">
        <Reveal>
          <p className="label text-oxblood">Membership</p>
          <h1 className="display-lg mt-6 text-ink">
            {sessionId ? "The Lyceum is open to you." : "Nothing to confirm here."}
          </h1>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <Sheet>
            <p className="leading-relaxed text-ink-soft">
              {sessionId
                ? "Your payment went through. It can take a moment for the membership to register, so refresh the membership page if it still shows as inactive."
                : "We could not find a payment to confirm. Start again from the membership page."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-ink/15 pt-7">
              <Link to="/" className="btn-ink">
                Bring a question
              </Link>
              <Link to="/membership" className="link-underline">
                Membership
              </Link>
            </div>
          </Sheet>
        </Reveal>
      </div>
    </PageFrame>
  );
}
