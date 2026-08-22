import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createMembershipCheckout } from "@/lib/payments.functions";

export function MembershipCheckout({ priceId }: { priceId: string }) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createMembershipCheckout({
      data: {
        priceId,
        returnUrl: `${window.location.origin}/membership/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Checkout could not be started.");
    return result.clientSecret;
  };

  return (
    <div id="checkout" className="mt-10 border border-ink/25 bg-papyrus-light/70 p-4 sm:p-6">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
