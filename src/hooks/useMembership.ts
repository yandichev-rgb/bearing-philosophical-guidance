import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { useAuth } from "./useAuth";

/** Whether the signed-in account currently has an active Bearing membership. */
export function useMembership() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["membership", userId],
    enabled: Boolean(userId) && paymentsConfigured(),
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, price_id, current_period_end, cancel_at_period_end")
        .eq("user_id", userId!)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
  });

  const periodEnd = data?.current_period_end ? new Date(data.current_period_end) : null;
  const inPeriod = !periodEnd || periodEnd.getTime() > Date.now();
  const isMember = Boolean(
    data &&
      inPeriod &&
      ["active", "trialing", "past_due", "canceled"].includes(data.status) &&
      !(data.status === "canceled" && !periodEnd),
  );

  return {
    isMember,
    subscription: data ?? null,
    pastDue: data?.status === "past_due",
    loading: isLoading,
    refetch,
  };
}
