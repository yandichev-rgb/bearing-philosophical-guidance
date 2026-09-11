import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { startReadingPurchase } from "@/lib/reading-credits.functions";
import { storeCreditToken } from "@/lib/reading-credit-token";
import { SINGLE_READING } from "@/lib/reading-types";

/**
 * The one place a reader is asked to pay for a further reading. The first
 * reading is never touched by this: it arrives complete and free.
 */
export function ReadingPurchase({
  message,
  onEditAnswers,
  onClose,
  onCheckoutStarted,
}: {
  message: string;
  onEditAnswers: () => void;
  onClose: () => void;
  onCheckoutStarted?: () => void;
}) {
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = async (): Promise<string> => {
    const result = await startReadingPurchase({
      data: {
        returnUrl: `${window.location.origin}/reading/return`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Checkout could not be started.");
    storeCreditToken(result.token);
    return result.clientSecret;
  };

  return (
    <div>
      <p className="label text-oxblood">A further reading</p>
      <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
        Another question, another reading.
      </h2>
      <p className="mt-6 max-w-[62ch] leading-relaxed text-ink-soft">{message}</p>
      <p className="mt-4 max-w-[62ch] leading-relaxed text-ink-soft">
        Your answers have been kept. Nothing is generated until the payment clears, and the reading
        you receive is complete: the bearing, the lens, the better question, the experiment and the
        return.
      </p>

      {checkout ? (
        <ReadingCheckout fetchClientSecret={fetchClientSecret} />
      ) : (
        <div className="mt-9 flex flex-wrap items-center gap-6">
          <button
            type="button"
            className="btn-ink"
            onClick={() => {
              setError(null);
              setCheckout(true);
              onCheckoutStarted?.();
            }}
          >
            Continue for {SINGLE_READING.display} <span aria-hidden="true">→</span>
          </button>
          <Link to="/membership" className="link-underline">
            Or see membership
          </Link>
          <button type="button" className="link-underline" onClick={onEditAnswers}>
            Edit my answers
          </button>
          <button type="button" className="link-underline" onClick={onClose}>
            Return to the Lyceum
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-5 text-sm text-oxblood" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReadingCheckout({ fetchClientSecret }: { fetchClientSecret: () => Promise<string> }) {
  return (
    <div className="mt-9 border border-ink/25 bg-papyrus-light/70 p-4 sm:p-6">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
