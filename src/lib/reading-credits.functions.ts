import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "./stripe.server";
import { SINGLE_READING } from "./reading-types";

const envSchema = z.enum(["sandbox", "live"]);
const tokenSchema = z.string().regex(/^[a-f0-9-]{20,80}$/);

/**
 * A single paid reading. One row per purchase, created before checkout and only
 * honoured once Stripe confirms payment. The browser holds the token; the
 * server holds the truth about whether it is paid.
 */

export const startReadingPurchase = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        returnUrl: z.string().url(),
        environment: envSchema,
        visitorId: z.string().max(80).optional(),
      })
      .parse(data),
  )
  .handler(
    async ({ data }): Promise<{ clientSecret: string; token: string } | { error: string }> => {
      const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "").slice(0, 48);
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { visitorHash } = await import("./reading-access.server");
        const stripe = createStripeClient(data.environment as StripeEnv);

        const prices = await stripe.prices.list({ lookup_keys: [SINGLE_READING.priceId] });
        const price = prices.data[0];
        if (!price) throw new Error("Single readings are not available at the moment.");

        const session = await stripe.checkout.sessions.create({
          line_items: [{ price: price.id, quantity: 1 }],
          mode: "payment",
          ui_mode: "embedded_page",
          return_url: `${data.returnUrl}?token=${token}&session_id={CHECKOUT_SESSION_ID}`,
          automatic_tax: { enabled: true },
          metadata: { readingToken: token, kind: "individual_reading" },
        });

        await supabaseAdmin.from("reading_credits").insert({
          token,
          visitor_hash: await visitorHash(),
          stripe_session_id: session.id,
          environment: data.environment,
          status: "pending",
        });

        return { clientSecret: session.client_secret ?? "", token };
      } catch (error) {
        return { error: getStripeErrorMessage(error) };
      }
    },
  );

/**
 * Confirms a purchase directly with Stripe on return from checkout, so the
 * reader never waits on webhook delivery.
 */
export const confirmReadingPurchase = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: tokenSchema, environment: envSchema }).parse(data),
  )
  .handler(async ({ data }): Promise<{ paid: boolean; error?: string }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: credit } = await supabaseAdmin
        .from("reading_credits")
        .select("id, status, stripe_session_id")
        .eq("token", data.token)
        .maybeSingle();
      if (!credit) return { paid: false, error: "That purchase could not be found." };
      if (credit.status === "paid") return { paid: true };
      if (!credit.stripe_session_id) return { paid: false };

      const stripe = createStripeClient(data.environment as StripeEnv);
      const session = await stripe.checkout.sessions.retrieve(credit.stripe_session_id);
      const paid = session.payment_status !== "unpaid";
      if (paid) {
        await supabaseAdmin
          .from("reading_credits")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          })
          .eq("id", credit.id);
      }
      return { paid };
    } catch (error) {
      return { paid: false, error: getStripeErrorMessage(error) };
    }
  });

/** Reopens the reading a paid credit already produced, so a refresh is safe. */
export const fetchPurchasedReading = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token: tokenSchema }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: credit } = await supabaseAdmin
      .from("reading_credits")
      .select("status, reading")
      .eq("token", data.token)
      .maybeSingle();
    if (!credit || credit.status !== "paid") return { status: "unknown" as const };
    if (credit.reading) return { status: "reading" as const, reading: credit.reading };
    return { status: "unused" as const };
  });
