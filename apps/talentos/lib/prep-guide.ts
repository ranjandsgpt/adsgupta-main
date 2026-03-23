import { generateLLMResponse } from "./llm";
import type { CompanyIntel } from "./company-intelligence";

type AnalysisLike = {
  roleName: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
};

type ResumeLike = {
  name: string;
  currentRole: string;
  experienceYears: number;
  experience?: unknown;
};

export type PrepGuide = {
  cheatSheet: {
    elevatorPitch: string;
    topSellingPoints: string[];
    gapMitigation: string[];
    questionsToAskThem: string[];
  };
  studyTopics: Array<{
    topic: string;
    why: string;
    resources: string;
    timeNeeded: "30min" | "1hr" | "2hr" | "4hr";
  }>;
  behavioralBank: Array<{
    theme: "Leadership" | "Conflict" | "Failure" | "Success" | "Innovation";
    suggestedStory: string;
    keyMetric: string;
  }>;
  dayOfChecklist: string[];
};

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON from LLM");
  return JSON.parse(match[0]) as T;
}

export async function generatePrepGuide(
  analysis: AnalysisLike,
  companyIntel: CompanyIntel,
  resumeData: ResumeLike
): Promise<PrepGuide> {
  const userPrompt = `Create a personalized interview preparation guide for this candidate.

Candidate: ${resumeData.name}, ${resumeData.currentRole}, ${resumeData.experienceYears} years experience
Target role: ${analysis.roleName} at ${companyIntel.companyName}
Match score: ${analysis.matchScore}%
Strengths: ${JSON.stringify(analysis.strengths)}
Gaps: ${JSON.stringify(analysis.gaps)}
Company intelligence: ${JSON.stringify(companyIntel)}
Resume experience: ${JSON.stringify(resumeData.experience ?? [])}

Return JSON:
{
  "cheatSheet": {
    "elevatorPitch": "a 30-second pitch this candidate should memorize",
    "topSellingPoints": ["3 key points to drive home in every answer"],
    "gapMitigation": ["for each gap, a strategy to address it if asked"],
    "questionsToAskThem": ["5 smart questions to ask the interviewer that show research and interest"]
  },
  "studyTopics": [
    {
      "topic": "specific topic to study",
      "why": "why this matters for this role",
      "resources": "what to read or practice",
      "timeNeeded": "30min|1hr|2hr|4hr"
    }
  ],
  "behavioralBank": [
    {
      "theme": "Leadership|Conflict|Failure|Success|Innovation",
      "suggestedStory": "a STAR story outline using the candidate's actual resume experience",
      "keyMetric": "the number or result to highlight"
    }
  ],
  "dayOfChecklist": ["practical tips for interview day — what to prepare, bring, review"]
}`;

  const raw = await generateLLMResponse(
    "You are an interview coach creating high-quality personalized prep plans. Return strict JSON only.",
    userPrompt,
    true
  );
  return parseJson<PrepGuide>(raw);
}
