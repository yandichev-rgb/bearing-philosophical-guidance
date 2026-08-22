import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isProfileSlug, type ProfileSlug } from "./philosopher-profiles.server";
import { generateReadingWithAI, type GeneratedReading } from "./readings.server";

const answersSchema = z.object({
  situation: z.string().trim().min(1).max(4000),
  tried: z.string().trim().max(4000).default(""),
  stakes: z.string().trim().max(4000).default(""),
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
  .handler(async ({ data }) => generateReadingWithAI("aristotle", data));

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
      const { data: membership } = await context.supabase
        .from("memberships")
        .select("status")
        .eq("user_id", context.userId)
        .maybeSingle();
      if (membership?.status !== "active") {
        throw new Error("Membership required to consult the full Lyceum.");
      }
    }
    return generateReadingWithAI(philosopherSlug as ProfileSlug, answers);
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
      })
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
