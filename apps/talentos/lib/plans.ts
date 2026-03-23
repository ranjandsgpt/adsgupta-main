export const PLANS = {
  free: {
    name: "Explorer",
    price: 0,
    currency: "USD",
    features: ["3 resume analyses", "1 mock interview", "Basic job search", "Community support"],
    limits: { analyses: 3, interviews: 1, prepGuides: 0, smartRecommendations: false },
  },
  pro: {
    name: "Professional",
    priceINR: 499,
    priceUSD: 5.99,
    currency: "INR",
    period: "month",
    features: [
      "Unlimited resume analyses",
      "Unlimited mock interviews",
      "All 4 interviewer personas",
      "Company intelligence reports",
      "Personalized prep guides",
      "AI job recommendations",
      "STAR score tracking",
      "PDF export",
      "Priority support",
    ],
    limits: { analyses: -1, interviews: -1, prepGuides: -1, smartRecommendations: true },
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Everything in Pro",
      "Bulk candidate screening",
      "Custom question banks",
      "Team analytics dashboard",
      "API access",
      "Dedicated support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
