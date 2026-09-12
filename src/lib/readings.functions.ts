import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  isProfileSlug,
  isRetiredSlug,
  philosopherName,
  type ProfileSlug,
} from "./philosopher-profiles.server";
import {
  FOLLOW_UP_MODEL,
  forClient,
  generateFollowUpWithAI,
  readingModels,
  runReadingPipeline,
} from "./readings.server";
import { READING_PAYMENT_MESSAGE, type ReadingResult } from "./reading-types";

import { hasActiveMembership } from "./membership.server";
import { FOLLOWUPS_PER_READING } from "@/config/membership";
import { assertDailyBudget, logAiUsage } from "./ai-budget.server";


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

const sourceSchema = z.object({ work: z.string(), location: z.string() });

const readingSchema = z.object({
  philosopherSlug: z.string(),
  title: z.string().min(1),
  bearing: z.string().min(1),
  throughLens: z.string().min(1),
  conceptsUsed: z.array(z.string()).default([]),
  sources: z.array(sourceSchema).default([]),
  betterQuestion: z.string().min(1),
  practice: z.object({
    title: z.string().default(""),
    duration: z.string().default(""),
    steps: z.array(z.string()).default([]),
    whatToObserve: z.string().default(""),
  }),
  alternativeReading: z.string().default(""),
  returnPrompt: z.string().default(""),
  limitation: z.string().default(""),
  intakeEvidenceUsed: z.array(z.string()).default([]),
  citation: z.string().default(""),
  lensName: z.string().default(""),
  note: z.string().default(""),
});

/**
 * Runs the pipeline and turns every outcome into a discriminated result. Nothing
 * is counted or charged unless an actual reading came back.
 */
async function produce(input: {
  slug: ProfileSlug;
  answers: z.infer<typeof answersSchema>;
  tier: "free" | "member";
  userId?: string;
  /** How the reader is entitled to this reading, decided before any model call. */
  via?: "free" | "member" | "credit";
  creditId?: string;
  visitorId?: string | undefined;
}): Promise<ReadingResult> {
  await assertDailyBudget();

  const models = readingModels();
  const { result, usage, telemetry } = await runReadingPipeline(input.slug, input.answers);

  // Usage is billed for every call actually made, including a rejected one.
  if (usage.promptTokens > 0 || usage.completionTokens > 0) {
    await logAiUsage({
      userId: input.userId ?? null,
      philosopherSlug: input.slug,
      model: telemetry.models.writer ?? models.planner,
      tier: input.tier,
      usage,
    });
  }

  if (result.kind !== "reading") return result;

  const reading = forClient(result.reading);

  // The free reading is only spent once a real reading exists, and a paid credit
  // is only marked used once its reading has been stored.
  if (input.via === "free") {
    const { consumeFreeReading } = await import("./reading-access.server");
    await consumeFreeReading(input.userId, input.visitorId);
  } else if (input.via === "credit" && input.creditId) {
    const { attachReadingToCredit } = await import("./reading-access.server");
    await attachReadingToCredit({
      creditId: input.creditId,
      philosopherSlug: input.slug,
      answers: input.answers,
      reading,
    });
  }

  return { kind: "reading", reading };
}

/**
 * The first reading: one complete reading, free, no account required, in the
 * lens of whichever thinker was chosen. Every further reading needs one paid
 * credit or a membership, so the gate is resolved before any model call.
 */
export const generateFreeReading = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    answersSchema
      .extend({
        creditToken: z.string().max(80).optional(),
        visitorId: z.string().max(80).optional(),
        philosopherSlug: z.string().max(60).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<ReadingResult> => {
    const { creditToken, visitorId, philosopherSlug, ...answers } = data;

    const requested = philosopherSlug ?? "aristotle";
    if (!isProfileSlug(requested) || isRetiredSlug(requested)) {
      return { kind: "error", message: "That thinker is not in the Lyceum.", retryable: false };
    }

    const { resolveReadingAccess } = await import("./reading-access.server");
    const access = await resolveReadingAccess({ creditToken, visitorId });

    if (!access.allowed) {
      console.info("reading gate: payment required", { readingNumber: access.readingNumber });
      return {
        kind: "payment_required",
        readingNumber: access.readingNumber,
        message: READING_PAYMENT_MESSAGE,
      };
    }

    return produce({
      slug: requested,
      answers,
      tier: "free",
      via: access.via,
      visitorId,
      ...(access.via === "credit" ? { creditId: access.creditId } : {}),
    });
  });


/** Membership tier: any philosopher in the Lyceum. */
export const generateMemberReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    answersSchema.extend({ philosopherSlug: z.string() }).parse(data),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<ReadingResult | { kind: "membership" }> => {
      const { philosopherSlug, ...answers } = data;
      if (!isProfileSlug(philosopherSlug) || isRetiredSlug(philosopherSlug)) {
        return { kind: "error", message: "That thinker is not in the Lyceum.", retryable: false };
      }
      if (philosopherSlug !== "aristotle") {
        const isMember = await hasActiveMembership(context.supabase, context.userId);
        if (!isMember) return { kind: "membership" as const };
      }

      return produce({
        slug: philosopherSlug,
        answers,
        tier: "member",
        userId: context.userId,
      });
    },
  );

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

    const reading = data.reading;
    const { data: saved, error: readingError } = await context.supabase
      .from("readings")
      .insert({
        user_id: context.userId,
        inquiry_id: inquiry.id,
        philosopher_slug: reading.philosopherSlug,
        headline: reading.title,
        noticed: reading.bearing,
        method: reading.throughLens,
        grounding: reading.citation,
        question: reading.betterQuestion,
        limits: reading.limitation,
        return_prompt: reading.returnPrompt,
        alternative_reading: reading.alternativeReading,
        sources: reading.sources,
        lens_name: reading.lensName,
        concepts_used: reading.conceptsUsed,
        practice_title: reading.practice.title,
        practice_duration: reading.practice.duration,
        practice_steps: reading.practice.steps,
        what_to_observe: reading.practice.whatToObserve,
        note: reading.note,
        // Retired columns, written empty so old rows and new rows share a shape.
        exercise: [...reading.practice.steps, reading.practice.whatToObserve].join(" "),
        assumption: "",
        principle: "",
        tension: "",
        challenge: "",
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
        "id, philosopher_slug, headline, exercise, question, created_at, tension, method, grounding, challenge, limits, return_prompt, noticed, assumption, principle, note, lens_name, concepts_used, practice_title, practice_duration, practice_steps, what_to_observe, alternative_reading, sources",
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
      .select("id, philosopher_slug, headline, noticed, exercise, question, inquiry_id, method, limits")
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
        method: reading.method,
        question: reading.question,
        exercise: reading.exercise,
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
      model: FOLLOW_UP_MODEL,
      tier: "member",
      usage,
    });

    return {
      followUp: inserted,
      remaining: FOLLOWUPS_PER_READING - (prior.length + 1),
    };
  });
