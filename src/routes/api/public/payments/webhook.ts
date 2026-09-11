import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { verifyWebhook, type StripeEnv } from "@/lib/stripe.server";

let client: any = null;
function getSupabase() {
  if (!client) {
    client = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return client;
}

function priceIdOf(item: any): string {
  return item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
}

function iso(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/** Keeps the membership row in step with the subscription row. */
async function syncMembership(userId: string, status: string, periodEnd: string | null) {
  const active = ["active", "trialing", "past_due"].includes(status);
  await getSupabase()
    .from("memberships")
    .upsert(
      {
        user_id: userId,
        status: active ? "active" : "free",
        plan: "bearing_membership",
        current_period_end: periodEnd,
      },
      { onConflict: "user_id" },
    );
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("Subscription webhook without userId metadata", subscription.id);
    return;
  }
  const item = subscription.items?.data?.[0];
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const currentPeriodEnd = iso(periodEnd);

  await getSupabase()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        product_id: item?.price?.product ?? "bearing_membership",
        price_id: priceIdOf(item),
        status: subscription.status,
        current_period_start: iso(periodStart),
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );

  await syncMembership(userId, subscription.status, currentPeriodEnd);
}

async function cancelSubscription(subscription: any, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  const userId = subscription.metadata?.userId;
  if (userId) await syncMembership(userId, "canceled", null);
}

/** Marks a purchased single reading as paid so the reader may generate it. */
async function markReadingCreditPaid(session: any) {
  const token = session.metadata?.readingToken;
  if (!token) return;
  if (session.payment_status === "unpaid") return;
  await getSupabase()
    .from("reading_credits")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    })
    .eq("token", token);
}


export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await upsertSubscription(event.data.object, env);
              break;
            case "customer.subscription.deleted":
              await cancelSubscription(event.data.object, env);
              break;
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
              await markReadingCreditPaid(event.data.object);
              break;
            default:

              console.log("Unhandled payment event:", event.type);
          }
          return Response.json({ received: true });
        } catch (error) {
          console.error("Payment webhook error:", error);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
