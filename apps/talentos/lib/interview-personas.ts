export const PERSONAS = {
  recruiter: {
    name: "Sarah Chen",
    title: "Senior Technical Recruiter",
    style:
      "Friendly but evaluative. Focuses on culture fit, salary expectations, motivation, career trajectory. Asks 'why' questions. Keeps answers short and conversational.",
    focusAreas: ["motivation", "culture_fit", "career_goals", "salary", "availability"],
    roundName: "Recruiter Screen",
  },
  hiring_manager: {
    name: "Michael Torres",
    title: "Hiring Manager",
    style:
      "Direct and analytical. Focuses on impact, team dynamics, decision-making. Wants specific examples with metrics. Challenges vague answers. Uses STAR method evaluation.",
    focusAreas: ["leadership", "impact", "decision_making", "team_management", "conflict_resolution"],
    roundName: "Hiring Manager Round",
  },
  technical_peer: {
    name: "Priya Sharma",
    title: "Senior Engineer / Domain Expert",
    style:
      "Curious and deep-diving. Asks follow-up questions on technical details. Wants to understand HOW you built things, not just WHAT. Challenges assumptions. Will ask edge cases.",
    focusAreas: ["technical_depth", "problem_solving", "system_design", "edge_cases", "tradeoffs"],
    roundName: "Technical / Domain Round",
  },
  bar_raiser: {
    name: "David Kim",
    title: "VP / Bar Raiser",
    style:
      "Strategic and high-level. Focuses on long-term thinking, business impact, innovation. Asks 'what would you do if' scenarios. Evaluates leadership potential and vision.",
    focusAreas: ["strategic_thinking", "business_impact", "innovation", "leadership_potential", "vision"],
    roundName: "Bar Raiser / Leadership Round",
  },
} as const;

export type PersonaKey = keyof typeof PERSONAS;
