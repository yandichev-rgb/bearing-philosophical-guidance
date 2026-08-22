import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isProfileSlug, type ProfileSlug } from "./philosopher-profiles.server";
import { generateReadingWithAI, READING_MODEL, type GeneratedReading } from "./readings.server";
import { assertDailyBudget, claimFreeReading, logAiUsage } from "./ai-budget.server";

const answersSchema = z.object({
  situation: z.string().trim().min(1).max(4000),
  tried: z.string().trim().max(4000).default(""),
  stakes: z.string().trim().max(4000).default(""),
  kind: z
    .enum([
      "A decision to make",
      "A pattern that repeats",
      "A relationship",
      "A fear I keep meeting",
    ])
    .or(z.literal(""))
    .default(""),
  duration: z.enum(["Days", "Months", "Years"]).or(z.literal("")).default(""),
});

const readingSchema = z.object({
  philosopherSlug: z.string(),
  headline: z.string(),
  noticed: z.string(),
  assumption: z.string(),
  principle: z.string(),
  exercise: z.string(),
  question: z.string(),
  note: z.string(),
});

/** The free tier: one complete Aristotle reading, no account required. */
export const generateFreeReading = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => answersSchema.parse(data))
  .handler(async ({ data }) => {
    await assertDailyBudget();
    await claimFreeReading();
    const { reading, usage } = await generateReadingWithAI("aristotle", data);
    await logAiUsage({
      philosopherSlug: "aristotle",
      model: READING_MODEL,
      tier: "free",
      usage,
    });
    return reading;
  });

/** Membership tier: any philosopher in the Lyceum. */
export const generateMemberReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    answersSchema.extend({ philosopherSlug: z.string() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { philosopherSlug, ...answers } = data;
    if (!isProfileSlug(philosopherSlug)) throw new Error("Unknown philosopher.");
    if (philosopherSlug !== "aristotle") {
      const [{ data: membership }, { data: subscription }] = await Promise.all([
        context.supabase
          .from("memberships")
          .select("status, current_period_end")
          .eq("user_id", context.userId)
          .maybeSingle(),
        context.supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const stillInPeriod = (end: string | null | undefined) =>
        !end || new Date(end).getTime() > Date.now();
      const isMember =
        (membership?.status === "active" && stillInPeriod(membership.current_period_end)) ||
        (subscription != null &&
          ["active", "trialing", "past_due"].includes(subscription.status) &&
          stillInPeriod(subscription.current_period_end));

      // Returned, not thrown: the modal shows the membership invitation instead
      // of surfacing an unhandled server error.
      if (!isMember) return { needsMembership: true as const };
    }

    await assertDailyBudget();
    const { reading, usage } = await generateReadingWithAI(
      philosopherSlug as ProfileSlug,
      answers,
    );
    await logAiUsage({
      userId: context.userId,
      philosopherSlug,
      model: READING_MODEL,
      tier: "member",
      usage,
    });
    return reading;
  });

/** Saves the inquiry and its reading against the signed-in account. */
export const saveReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ answers: answersSchema, reading: readingSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: inquiry, error: inquiryError } = await context.supabase
      .from("inquiries")
      .insert({
        user_id: context.userId,
        situation: data.answers.situation,
        tried: data.answers.tried,
        stakes: data.answers.stakes,
        kind: data.answers.kind || null,
        duration: data.answers.duration || null,
      } as never)
      .select("id")
      .single();
    if (inquiryError || !inquiry) throw new Error("Your inquiry could not be saved.");

    const reading = data.reading as GeneratedReading;
    const { error: readingError } = await context.supabase.from("readings").insert({
      user_id: context.userId,
      inquiry_id: inquiry.id,
      philosopher_slug: reading.philosopherSlug,
      headline: reading.headline,
      noticed: reading.noticed,
      assumption: reading.assumption,
      principle: reading.principle,
      exercise: reading.exercise,
      question: reading.question,
      note: reading.note,
    });
    if (readingError) throw new Error("Your reading could not be saved.");

    return { inquiryId: inquiry.id };
  });

/** Reading history for the signed-in account. */
export const listMyReadings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("readings")
      .select("id, philosopher_slug, headline, exercise, question, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Your readings could not be loaded.");
    return data ?? [];
  });

/** Estimated AI spend for the signed-in account, so cost per reading stays visible. */
export const myReadingCosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_usage")
      .select("philosopher_slug, cost_usd, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { readings: 0, totalUsd: 0 };
    const rows = data ?? [];
    const totalUsd = rows.reduce((sum, row) => sum + Number(row.cost_usd ?? 0), 0);
    return { readings: rows.length, totalUsd: Math.round(totalUsd * 10000) / 10000 };
  });
