/**
 * Spend logging and abuse limits for AI readings. Server only.
 *
 * Every reading is one gateway request billed to the workspace's AI credits, so
 * each call is logged with its token counts and an estimated cost, the free tier
 * is capped per visitor per day, and a daily spend ceiling stops runaway usage.
 */

import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

/** Free readings a single visitor may generate per UTC day. */
export const FREE_READINGS_PER_DAY = 3;

/** Hard ceiling on estimated AI spend per UTC day, in US dollars. */
export const DAILY_AI_BUDGET_USD = 5;

/** Approximate gateway prices in dollars per million tokens. */
const PRICES: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-flash": { input: 0.3, output: 2.5 },
};

export type Usage = { promptTokens: number; completionTokens: number };

export function estimateCostUsd(model: string, usage: Usage): number {
  const price = PRICES[model] ?? { input: 0.3, output: 2.5 };
  const cost =
    (usage.promptTokens * price.input + usage.completionTokens * price.output) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** A stable, non reversible identifier for an anonymous visitor. */
async function visitorHash(): Promise<string> {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const agent = getRequestHeader("user-agent") ?? "unknown";
  const bytes = new TextEncoder().encode(`bearing:${ip}:${agent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Throws when today's estimated AI spend has reached the ceiling. */
export async function assertDailyBudget(): Promise<void> {
  try {
    const { data } = await (await admin()).rpc("ai_spend_today");
    if (data !== null && data !== undefined && Number(data) >= DAILY_AI_BUDGET_USD) {
      throw new Error("Bearing has reached today's reading limit. Please try again tomorrow.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Bearing has reached")) throw error;
    // A failed check must not block readings.
  }
}

/** Consumes one free reading for this visitor. Throws when the cap is reached. */
export async function claimFreeReading(): Promise<void> {
  let hash: string;
  try {
    hash = await visitorHash();
  } catch {
    return;
  }
  const { data, error } = await (await admin()).rpc("claim_free_reading", {
    _visitor_hash: hash,
    _daily_limit: FREE_READINGS_PER_DAY,
  });
  if (error) return; // Never block a reading because the counter failed.
  if (data === false) {
    throw new Error(
      "You have used your free readings for today. Membership opens the full Lyceum.",
    );
  }
}

/** Records one gateway call so real per reading cost stays visible. */
export async function logAiUsage(input: {
  userId?: string | null;
  philosopherSlug: string;
  model: string;
  tier: "free" | "member";
  usage: Usage;
}): Promise<void> {
  try {
    await (await admin()).from("ai_usage").insert({
      user_id: input.userId ?? null,
      philosopher_slug: input.philosopherSlug,
      model: input.model,
      tier: input.tier,
      prompt_tokens: input.usage.promptTokens,
      completion_tokens: input.usage.completionTokens,
      cost_usd: estimateCostUsd(input.model, input.usage),
    });
  } catch (error) {
    console.error("Failed to log AI usage", error);
  }
}
