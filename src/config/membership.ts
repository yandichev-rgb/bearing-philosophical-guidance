/**
 * Membership configuration. Pricing is intentionally unset so a real plan can be
 * added later without touching the interface. Set priceLabel and stripePriceId
 * when the plan is decided.
 */
export const MEMBERSHIP = {
  priceLabel: null as string | null,
  interval: "month" as "month" | "year",
  stripePriceId: null as string | null,
  freeReadingsIncluded: 1,
  freePhilosopherSlug: "aristotle",
};
