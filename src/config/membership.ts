/**
 * Membership configuration. Price IDs match the plans registered with the
 * payment provider and are stable across test and live environments.
 */
export const MEMBERSHIP = {
  interval: "month" as "month" | "year",
  freeReadingsPerDay: 3,
  freePhilosopherSlug: "aristotle",
  priceLabel: "8.99 a month, or 89.90 a year",
  plans: [
    {
      priceId: "membership_monthly",
      label: "Monthly",
      price: "$8.99",
      cadence: "a month",
      note: "Cancel whenever you like.",
    },
    {
      priceId: "membership_yearly",
      label: "Yearly",
      price: "$89.90",
      cadence: "a year",
      note: "Two months included at no extra cost.",
    },
  ],
  benefits: [
    "Unlimited readings, with no daily limit.",
    "Every mind in the Lyceum, not only Aristotle.",
    "Your full reading history, kept with the inquiry that produced it.",
    "Read one question through several philosophers side by side.",
    "Ask follow up questions on any reading.",
  ],
};
