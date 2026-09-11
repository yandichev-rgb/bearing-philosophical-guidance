import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageFrame, Sheet } from "@/components/PageFrame";
import { Reveal } from "@/components/Reveal";
import { confirmReadingPurchase } from "@/lib/reading-credits.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { storeCreditToken } from "@/lib/reading-credit-token";
import { trackEvent } from "@/lib/analytics.functions";
import { analyticsSessionId } from "@/lib/reading-credit-token";

const title = "Your reading is ready to prepare · Bearing";
const description = "Confirming the purchase of a single Bearing reading.";

export const Route = createFileRoute("/reading/return")({
  validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
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
  component: ReadingReturn,
});

function ReadingReturn() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"checking" | "paid" | "pending" | "missing">(
    token ? "checking" : "missing",
  );

  useEffect(() => {
    if (!token) return;
    storeCreditToken(token);
    let cancelled = false;
    (async () => {
      const result = await confirmReadingPurchase({
        data: { token, environment: getStripeEnvironment() },
      });
      if (cancelled) return;
      setState(result.paid ? "paid" : "pending");
      void trackEvent({
        data: {
          event: result.paid
            ? "second_reading_purchase_completed"
            : "second_reading_purchase_failed",
          sessionId: analyticsSessionId(),
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <PageFrame folio="Fol. II · A further reading">
      <div className="shell max-w-2xl py-20">
        <Reveal>
          <p className="label text-oxblood">A further reading</p>
          <h1 className="display-lg mt-6 text-ink">
            {state === "paid"
              ? "Your reading is paid for."
              : state === "checking"
                ? "Confirming your payment."
                : state === "pending"
                  ? "The payment has not settled yet."
                  : "Nothing to confirm here."}
          </h1>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <Sheet>
            <p className="leading-relaxed text-ink-soft">
              {state === "paid"
                ? "Return to your question and continue. Your answers were kept exactly as you wrote them, and the reading will be prepared in full."
                : state === "checking"
                  ? "One moment."
                  : state === "pending"
                    ? "Some payment methods take a little longer to clear. Return to your question and continue; if it is still not ready, try again shortly."
                    : "We could not find a payment to confirm."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-ink/15 pt-7">
              <Link to="/" search={{ reading: "continue" }} className="btn-ink">
                Continue to my reading <span aria-hidden="true">→</span>
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
