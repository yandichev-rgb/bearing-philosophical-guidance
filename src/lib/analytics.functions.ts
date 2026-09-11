import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Minimal experiment analytics. Only event names, a browser session id and small
 * scalar properties are recorded. Situations, stakes and reading text never are.
 */

export const ANALYTICS_EVENTS = [
  "reading_started",
  "reading_completed",
  "first_reading_completed",
  "second_reading_started",
  "second_reading_paywall_viewed",
  "second_reading_checkout_started",
  "second_reading_purchase_completed",
  "second_reading_purchase_failed",
  "second_reading_unlocked",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const propsSchema = z
  .record(z.string().max(40), z.union([z.string().max(120), z.number(), z.boolean(), z.null()]))
  .default({});

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        event: z.enum(ANALYTICS_EVENTS),
        sessionId: z.string().max(80).optional(),
        props: propsSchema.optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("analytics_events").insert({
        event: data.event,
        session_id: data.sessionId ?? null,
        props: (data.props ?? {}) as never,
      });
    } catch (error) {
      console.error("analytics insert failed", (error as Error).message);
    }
    return { ok: true };
  });
