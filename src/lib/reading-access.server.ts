/**
 * Who may receive a reading. Server only.
 *
 * One complete reading is free per visitor (and per account). Every further
 * reading needs either an active membership or one paid reading credit. The
 * decision is made here, on the server, so client state cannot grant access.
 */

import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * A stable, non reversible identifier for an anonymous visitor. When the browser
 * supplies its own random id we key on that, because network addresses change
 * between visits and would otherwise hand out a new free reading each time.
 */
export async function visitorHash(visitorId?: string): Promise<string> {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const agent = getRequestHeader("user-agent") ?? "unknown";
  const seed = visitorId ? `vid:${visitorId}` : `${ip}:${agent}`;
  const bytes = new TextEncoder().encode(`bearing:${seed}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ReadingAccess =
  | { allowed: true; via: "free" | "member" }
  | { allowed: true; via: "credit"; creditId: string }
  | { allowed: false; readingNumber: number };

/** True when this visitor or account has already taken its one free reading. */
async function freeReadingUsed(userId?: string, visitorId?: string): Promise<boolean> {
  const hash = await visitorHash(visitorId);
  const db = await admin();
  const [{ data: byVisitor }, byUser] = await Promise.all([
    db.from("reading_entitlements").select("id").eq("visitor_hash", hash).maybeSingle(),
    userId
      ? db.from("reading_entitlements").select("id").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return Boolean(byVisitor || byUser?.data);
}

/** How many readings this visitor has had, used only for analytics labels. */
export async function readingNumber(userId?: string, visitorId?: string): Promise<number> {
  const hash = await visitorHash(visitorId);
  const db = await admin();
  const { count } = await db
    .from("reading_credits")
    .select("id", { count: "exact", head: true })
    .eq("visitor_hash", hash)
    .not("reading", "is", null);
  const used = await freeReadingUsed(userId, visitorId);
  return (used ? 1 : 0) + (count ?? 0) + 1;
}

/**
 * Resolves access for one reading request. A credit token only counts when the
 * matching row is confirmed paid and has not yet produced a reading.
 */
export async function resolveReadingAccess(input: {
  creditToken?: string | undefined;
  userId?: string | undefined;
  visitorId?: string | undefined;
  isMember?: boolean;
  /** Only Aristotle can be read for free; the other five are $0.99 each. */
  philosopherSlug?: string | undefined;
}): Promise<ReadingAccess> {
  if (input.isMember) return { allowed: true, via: "member" };

  if (input.creditToken) {
    const { data } = await (await admin())
      .from("reading_credits")
      .select("id, status, reading")
      .eq("token", input.creditToken)
      .maybeSingle();
    if (data && data.status === "paid" && data.reading === null) {
      return { allowed: true, via: "credit", creditId: data.id };
    }
  }

  const freeSlug = (input.philosopherSlug ?? "aristotle") === "aristotle";
  if (freeSlug && !(await freeReadingUsed(input.userId, input.visitorId))) {
    return { allowed: true, via: "free" };
  }

  return { allowed: false, readingNumber: await readingNumber(input.userId, input.visitorId) };
}

/** Marks the one free reading as taken, for this visitor and account. */
export async function consumeFreeReading(userId?: string, visitorId?: string): Promise<void> {
  try {
    const hash = await visitorHash(visitorId);
    const db = await admin();
    await db.from("reading_entitlements").insert({ visitor_hash: hash, user_id: userId ?? null });
  } catch {
    // Never fail a reading that has already been produced.
  }
}

/** Stores the reading produced against a paid credit so it can be reopened. */
export async function attachReadingToCredit(input: {
  creditId: string;
  philosopherSlug: string;
  answers: unknown;
  reading: unknown;
}): Promise<void> {
  await (await admin())
    .from("reading_credits")
    .update({
      philosopher_slug: input.philosopherSlug,
      answers: input.answers as never,
      reading: input.reading as never,
    })
    .eq("id", input.creditId);
}
