import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { MEMBERSHIP } from "@/config/membership";
import { MembershipCheckout } from "@/components/MembershipCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PageFrame, Sheet } from "@/components/PageFrame";
import { Reveal } from "@/components/Reveal";
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
    <PageFrame
      folio="Fol. II · Membership"
      banner={<PaymentTestModeBanner />}
      actions={
        <Link to="/readings" className="nav-link">
          Your readings
        </Link>
      }
    >
      <div className="shell max-w-3xl py-16 lg:py-20">
        <Reveal>
          <p className="label text-oxblood">Membership</p>
          <h1 className="display-lg mt-6 text-ink">
            See the same question
            <br />
            from every side.
          </h1>
          <p className="mt-7 max-w-xl leading-relaxed text-ink-soft">
            Membership opens all six philosophical approaches, unlimited readings, and a history of
            the questions you have brought to Bearing.
          </p>
        </Reveal>


        <Reveal delay={0.08} className="mt-12">
          <Sheet>
            <p className="label text-ink-soft">What membership opens</p>
            <ul className="mt-6 border-t border-ink/20">
              {MEMBERSHIP.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex gap-4 border-b border-ink/15 py-4 leading-relaxed text-ink"
                >
                  <span aria-hidden="true" className="mt-1 text-[0.7rem] text-oxblood">
                    ◆
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {isMember && session ? (
              <div className="mt-8">
                <p className="label text-oxblood">
                  {pastDue ? "Your last payment did not go through." : "Your membership is active."}
                </p>
                {subscription?.current_period_end ? (
                  <p className="mt-4 text-ink-soft">
                    {subscription.cancel_at_period_end ? "Access ends" : "Renews"} on{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString()}.
                  </p>
                ) : null}
                <button type="button" className="btn-ink mt-7" onClick={manage}>
                  Manage membership
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 grid gap-px border border-ink/30 bg-ink/25 sm:grid-cols-2">
                  {MEMBERSHIP.plans.map((plan) => {
                    const chosen = priceId === plan.priceId;
                    return (
                      <div
                        key={plan.priceId}
                        className={`p-6 ${chosen ? "bg-ink text-papyrus-light" : "bg-papyrus/50 text-ink"}`}
                      >
                        <p className="label">{plan.label}</p>
                        <p className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                          {plan.price}
                        </p>
                        <p className="mt-1 text-sm opacity-80">{plan.cadence}</p>
                        <p className="mt-4 text-sm opacity-80">{plan.note}</p>
                        <button
                          type="button"
                          onClick={() => setPriceId(plan.priceId)}
                          className={`label mt-6 border px-4 py-2 transition-colors duration-200 ${
                            chosen
                              ? "border-papyrus/60 text-papyrus-light"
                              : "border-ink text-ink hover:bg-ink/10"
                          }`}
                        >
                          Choose {plan.label.toLowerCase()}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                  Cancel whenever you like. Your answers stay private, and you can read how they are
                  handled in{" "}
                  <Link to="/privacy" className="link-underline">
                    Privacy
                  </Link>
                  .
                </p>

                {!paymentsConfigured() ? (
                  <p className="mt-8 text-ink-soft">
                    Membership checkout is not available in this build yet.
                  </p>
                ) : priceId && !session ? (
                  <div className="mt-8 border border-ink/25 bg-papyrus-light/70 p-5">
                    <p className="label text-oxblood">One step first</p>
                    <p className="mt-3 leading-relaxed text-ink-soft">
                      Sign in so your membership and your readings stay attached to your account.
                    </p>
                    <Link to="/auth" className="btn-ink mt-5 inline-block">
                      Sign in to continue
                    </Link>
                  </div>
                ) : priceId ? (
                  <MembershipCheckout priceId={priceId} />
                ) : null}
              </>
            )}


            {error ? (
              <p className="mt-6 text-sm text-oxblood" role="status">
                {error}
              </p>
            ) : null}
          </Sheet>
        </Reveal>
      </div>
    </PageFrame>
  );
}
