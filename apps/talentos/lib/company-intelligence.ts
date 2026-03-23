import { generateLLMResponse } from "./llm";

export type CompanyIntel = {
  companyName: string;
  industry: string;
  size: "startup" | "mid" | "large" | "enterprise";
  culture: {
    values: string[];
    workStyle: string;
    interviewStyle: string;
  };
  interviewProcess: {
    rounds: string[];
    duration: string;
    tips: string[];
  };
  commonQuestions: Array<{
    question: string;
    category: "Technical" | "Behavioral" | "Culture";
    tip: string;
  }>;
  whatTheyLookFor: string[];
  recentNews: string;
  whyJoinPitch: string;
};

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON from LLM");
  return JSON.parse(match[0]) as T;
}

export async function getCompanyIntel(companyName: string): Promise<CompanyIntel> {
  const response = await generateLLMResponse(
    "You are a career intelligence analyst. Return strict JSON only.",
    `You are a career intelligence analyst. Research and provide comprehensive interview intelligence for a candidate preparing to interview at ${companyName}.

Return ONLY valid JSON:
{
  "companyName": "${companyName}",
  "industry": "primary industry",
  "size": "startup|mid|large|enterprise",
  "culture": {
    "values": ["top 5 company values based on public information"],
    "workStyle": "description of work culture",
    "interviewStyle": "what their interviews are known for — e.g., 'rigorous technical rounds', 'heavy culture fit focus', 'case study based'"
  },
  "interviewProcess": {
    "rounds": ["typical round sequence — e.g., 'Phone Screen', 'Technical', 'System Design', 'Culture Fit'"],
    "duration": "typical timeline from application to offer",
    "tips": ["3-5 insider tips for interviewing here"]
  },
  "commonQuestions": [
    {
      "question": "a question this company is known to ask",
      "category": "Technical|Behavioral|Culture",
      "tip": "how to approach this question"
    }
  ],
  "whatTheyLookFor": ["specific traits and signals this company values in candidates"],
  "recentNews": "2-3 sentences about recent company developments that could come up in conversation",
  "whyJoinPitch": "a template answer for 'Why do you want to join ${companyName}?' that the candidate can personalize"
}`,
    true
  );
  return parseJson<CompanyIntel>(response);
}
