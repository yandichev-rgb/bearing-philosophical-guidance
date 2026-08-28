import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isProfileSlug, isRetiredSlug, type ProfileSlug } from "./philosopher-profiles.server";
import {
  generateFollowUpWithAI,
  generateReadingWithAI,
  READING_MODEL,
  type GeneratedReading,
} from "./readings.server";
import { hasActiveMembership } from "./membership.server";
import { FOLLOWUPS_PER_READING } from "@/config/membership";
import { assertDailyBudget, claimFreeReading, logAiUsage } from "./ai-budget.server";

const answersSchema = z.object({
  situation: z.string().trim().min(1).max(4000),
  tried: z.string().trim().max(4000).default(""),
  stakes: z.string().trim().max(4000).default(""),
  kind: z
    .enum(["A decision", "A recurring pattern", "A relationship", "A persistent fear"])
    .or(z.literal(""))
    .default(""),

  duration: z.enum(["Days", "Months", "Years"]).or(z.literal("")).default(""),
  clarifications: z
    .array(
      z.object({
        question: z.string().trim().max(400),
        answer: z.string().trim().max(2000),
      }),
    )
    .max(3)
    .default([]),
});

const readingSchema = z.object({
  philosopherSlug: z.string(),
  headline: z.string(),
  noticed: z.string(),
  tension: z.string(),
  method: z.string(),
  grounding: z.string(),
  challenge: z.string().default(""),
  limits: z.string(),
  question: z.string(),
  exercise: z.string(),
  returnPrompt: z.string(),
  assumption: z.string(),
  principle: z.string(),
  note: z.string(),
});

/**
 * Broad submissions ("I feel lost") get two or three adaptive questions before
 * anything is written. A short local check keeps the call off detailed entries.
 */
export const checkInquiryFocus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => answersSchema.parse(data))
  .handler(async ({ data }) => {
    const words = [data.situation, data.tried, data.stakes]
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    if (data.clarifications.length > 0 || words > 70) {
      return { needsClarification: false as const, questions: [] as string[] };
    }

    await assertDailyBudget();
    const result = await generateDiagnosticQuestions(data);
    await logAiUsage({
      philosopherSlug: "diagnostic",
      model: DIAGNOSTIC_MODEL,
      tier: "free",
      usage: result.usage,
    });
    return { needsClarification: result.needsClarification, questions: result.questions };
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
    if (!isProfileSlug(philosopherSlug) || isRetiredSlug(philosopherSlug))
      throw new Error("Unknown philosopher.");
    if (philosopherSlug !== "aristotle") {
      const isMember = await hasActiveMembership(context.supabase, context.userId);
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
    const { data: saved, error: readingError } = await context.supabase
      .from("readings")
      .insert({
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
      tension: reading.tension,
      method: reading.method,
      grounding: reading.grounding,
      challenge: reading.challenge,
      limits: reading.limits,
      return_prompt: reading.returnPrompt,
      })
      .select("id")
      .single();
    if (readingError || !saved) throw new Error("Your reading could not be saved.");

    return { inquiryId: inquiry.id, readingId: saved.id };
  });

/** Reading history for the signed-in account. */
export const listMyReadings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("readings")
      .select(
        "id, philosopher_slug, headline, exercise, question, created_at, tension, method, grounding, challenge, limits, return_prompt, noticed, assumption, principle, note",
      )
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

/** Follow up questions on one saved reading, oldest first. */
export const listFollowUps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ readingId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("reading_followups")
      .select("id, question, answer, created_at")
      .eq("reading_id", data.readingId)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Your follow up questions could not be loaded.");
    return { followUps: rows ?? [], limit: FOLLOWUPS_PER_READING };
  });

/** Members may ask a limited number of further questions about a saved reading. */
export const askFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        readingId: z.string().uuid(),
        question: z.string().trim().min(3).max(1000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const isMember = await hasActiveMembership(context.supabase, context.userId);
    if (!isMember) return { needsMembership: true as const };

    const { data: reading, error: readingError } = await context.supabase
      .from("readings")
      .select(
        "id, philosopher_slug, headline, noticed, assumption, principle, exercise, question, inquiry_id, tension, method, challenge, limits",
      )
      .eq("id", data.readingId)
      .maybeSingle();
    if (readingError || !reading) throw new Error("That reading could not be found.");
    if (!isProfileSlug(reading.philosopher_slug)) throw new Error("Unknown philosopher.");

    const [{ data: inquiry }, { data: history }] = await Promise.all([
      context.supabase
        .from("inquiries")
        .select("situation, tried, stakes, kind, duration")
        .eq("id", reading.inquiry_id)
        .maybeSingle(),
      context.supabase
        .from("reading_followups")
        .select("question, answer")
        .eq("reading_id", data.readingId)
        .order("created_at", { ascending: true }),
    ]);

    const prior = history ?? [];
    if (prior.length >= FOLLOWUPS_PER_READING) {
      return { limitReached: true as const };
    }

    await assertDailyBudget();
    const { answer, usage } = await generateFollowUpWithAI({
      slug: reading.philosopher_slug,
      answers: {
        situation: inquiry?.situation ?? "",
        tried: inquiry?.tried ?? "",
        stakes: inquiry?.stakes ?? "",
        kind: inquiry?.kind ?? "",
        duration: inquiry?.duration ?? "",
      },
      reading: {
        headline: reading.headline,
        noticed: reading.noticed,
        assumption: reading.assumption,
        principle: reading.principle,
        exercise: reading.exercise,
        question: reading.question,
        tension: reading.tension,
        method: reading.method,
        challenge: reading.challenge,
        limits: reading.limits,
      },
      history: prior.map((row) => ({ question: row.question, answer: row.answer })),
      question: data.question,
    });

    const { data: inserted, error: insertError } = await context.supabase
      .from("reading_followups")
      .insert({
        reading_id: data.readingId,
        user_id: context.userId,
        question: data.question,
        answer,
      } as never)
      .select("id, question, answer, created_at")
      .single();
    if (insertError || !inserted) throw new Error("Your question could not be saved.");

    await logAiUsage({
      userId: context.userId,
      philosopherSlug: reading.philosopher_slug,
      model: READING_MODEL,
      tier: "member",
      usage,
    });

    return {
      followUp: inserted,
      remaining: FOLLOWUPS_PER_READING - (prior.length + 1),
    };
  });
