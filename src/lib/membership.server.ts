/**
 * Membership checks shared by server functions. Server only.
 *
 * The check reads both the memberships row maintained by the payment webhook and
 * the most recent subscription row, so either source can keep access open.
 */

type MinimalClient = {
  from: (table: string) => {
    select: (columns: string) => any;
  };
};

const stillInPeriod = (end: string | null | undefined) =>
  !end || new Date(end).getTime() > Date.now();

export async function hasActiveMembership(
  supabase: MinimalClient,
  userId: string,
): Promise<boolean> {
  const [{ data: membership }, { data: subscription }] = await Promise.all([
    supabase
      .from("memberships")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    (membership?.status === "active" && stillInPeriod(membership.current_period_end)) ||
    (subscription != null &&
      ["active", "trialing", "past_due"].includes(subscription.status) &&
      stillInPeriod(subscription.current_period_end))
  );
}
