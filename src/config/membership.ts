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
    "Examine one situation through all six philosophical approaches.",
    "Return to earlier inquiries and see how your thinking changes.",
    "Create as many readings as you need, with no daily limit.",
  ],

};

