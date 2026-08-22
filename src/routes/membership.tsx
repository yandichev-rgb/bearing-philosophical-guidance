import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { MEMBERSHIP } from "@/config/membership";
import { MembershipCheckout } from "@/components/MembershipCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Seal, Wordmark } from "@/components/Seal";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";

const title = "Membership · Bearing";
const description =
  "Read one question through the full Lyceum. Unlimited readings, saved history, and follow up questions.";

export const Route = createFileRoute("/membership")({
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
  component: MembershipPage,
});

function MembershipPage() {
  const { session } = useAuth();
  const { isMember, subscription, pastDue } = useMembership();
  const [priceId, setPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const manage = async () => {
    setError(null);
    try {
      const result = await createPortalSession({
        data: {
          returnUrl: `${window.location.origin}/membership`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The billing page could not open.");
    }
  };

  return (
    <div className="paper grain min-h-screen">
      <PaymentTestModeBanner />
      <header className="border-b border-ink/25">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Bearing home">
            <Seal size={32} className="shrink-0" />
            <Wordmark />
          </Link>
          <Link to="/readings" className="nav-link">
            Your readings
          </Link>
        </div>
      </header>

      <main className="shell max-w-3xl py-16">
        <p className="label text-oxblood">Membership</p>
        <h1 className="display-lg mt-6 text-ink">
          One question can have
          <br />
          more than one honest answer.
        </h1>

        <ul className="mt-10 border-t border-ink/25">
          {MEMBERSHIP.benefits.map((benefit) => (
            <li key={benefit} className="border-b border-ink/20 py-4 leading-relaxed text-ink">
              {benefit}
            </li>
          ))}
        </ul>

        {!paymentsConfigured() ? (
          <p className="mt-10 text-ink-soft">
            Membership checkout is not available in this build yet.
          </p>
        ) : !session ? (
          <p className="mt-10">
            <Link to="/auth" className="btn-ink">
              Sign in to become a member
            </Link>
          </p>
        ) : isMember ? (
          <div className="mt-10">
            <p className="label text-oxblood">
              {pastDue ? "Your last payment did not go through." : "Your membership is active."}
            </p>
            {subscription?.current_period_end ? (
              <p className="mt-4 text-ink-soft">
                {subscription.cancel_at_period_end ? "Access ends" : "Renews"} on{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}.
              </p>
            ) : null}
            <button type="button" className="btn-ink mt-8" onClick={manage}>
              Manage membership
            </button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-px border border-ink/25 bg-ink/25 sm:grid-cols-2">
              {MEMBERSHIP.plans.map((plan) => (
                <button
                  key={plan.priceId}
                  type="button"
                  onClick={() => setPriceId(plan.priceId)}
                  className={`p-6 text-left transition-colors duration-200 ${
                    priceId === plan.priceId
                      ? "bg-ink text-papyrus-light"
                      : "bg-papyrus-light/70 text-ink hover:bg-papyrus-light"
                  }`}
                >
                  <p className="label">{plan.label}</p>
                  <p className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    {plan.price}
                  </p>
                  <p className="mt-1 text-sm opacity-80">{plan.cadence}</p>
                  <p className="mt-4 text-sm opacity-80">{plan.note}</p>
                </button>
              ))}
            </div>
            {priceId ? <MembershipCheckout priceId={priceId} /> : null}
          </>
        )}

        {error ? (
          <p className="mt-6 text-sm text-oxblood" role="status">
            {error}
          </p>
        ) : null}
      </main>
    </div>
  );
}
