import { generateLLMResponse } from "./llm";

export type ResumeData = {
  name: string;
  currentRole: string;
  experienceYears: number;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    certifications: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    highlights: string[];
    skills_used: string[];
  }>;
  education: Array<{ institution: string; degree: string; year: string }>;
  proofPoints: string[];
  summary: string;
};

export type MatchResult = {
  roleName: string;
  companyName: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  interviewQuestions: Array<{
    question: string;
    category: "Technical" | "Behavioral" | "Situational" | "Culture";
    difficulty: "Easy" | "Medium" | "Hard";
    why: string;
  }>;
  summary: string;
  prepAdvice: string;
};

function parseJsonBlock<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("LLM returned non-JSON content");
  }
  return JSON.parse(jsonMatch[0]) as T;
}

export async function analyzeResume(rawText: string): Promise<ResumeData> {
  const systemPrompt = `You are an expert resume analyst. Analyze the following resume and extract structured data.
Return ONLY valid JSON with this exact schema:
{
  "name": "candidate full name",
  "currentRole": "their current or most recent job title",
  "experienceYears": number,
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "certifications": ["cert1"]
  },
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "2020-2024",
      "highlights": ["achievement with metrics if available"],
      "skills_used": ["skill1", "skill2"]
    }
  ],
  "education": [{"institution": "name", "degree": "degree", "year": "year"}],
  "proofPoints": ["Top 3-5 quantifiable achievements from the resume"],
  "summary": "2-3 sentence professional summary"
}`;

  const response = await generateLLMResponse(systemPrompt, rawText, true);
  const parsed = parseJsonBlock<ResumeData>(response);
  return {
    name: parsed.name ?? "",
    currentRole: parsed.currentRole ?? "",
    experienceYears: Number(parsed.experienceYears ?? 0),
    skills: {
      technical: parsed.skills?.technical ?? [],
      soft: parsed.skills?.soft ?? [],
      tools: parsed.skills?.tools ?? [],
      certifications: parsed.skills?.certifications ?? [],
    },
    experience: parsed.experience ?? [],
    education: parsed.education ?? [],
    proofPoints: parsed.proofPoints ?? [],
    summary: parsed.summary ?? "",
  };
}

export async function analyzeMatch(resumeData: ResumeData, jobDescription: string): Promise<MatchResult> {
  const userPrompt = `You are a hiring expert. Compare this resume against this job description.
The resume is for: ${resumeData.currentRole}
The job requires: ${jobDescription}

Return ONLY valid JSON:
{
  "roleName": "exact role title from the JD",
  "companyName": "company name from JD if mentioned, else 'Target Company'",
  "matchScore": number 0-100,
  "strengths": ["specific strength with evidence from resume"],
  "gaps": ["specific gap — skill or experience the JD requires but resume lacks"],
  "interviewQuestions": [
    {
      "question": "specific interview question based on resume gaps or JD requirements",
      "category": "Technical|Behavioral|Situational|Culture",
      "difficulty": "Easy|Medium|Hard",
      "why": "why this question would be asked based on the gap or requirement"
    }
  ],
  "summary": "3-4 sentence summary of fit, written as if briefing a hiring manager",
  "prepAdvice": "3-4 sentences of specific advice for the candidate"
}`;

  const response = await generateLLMResponse(
    "You are a strict JSON generator for hiring analysis. Return only valid JSON.",
    `${JSON.stringify(resumeData)}\n\n${userPrompt}`,
    true
  );
  const parsed = parseJsonBlock<MatchResult>(response);
  return {
    roleName: parsed.roleName ?? "Target Role",
    companyName: parsed.companyName ?? "Target Company",
    matchScore: Math.max(0, Math.min(100, Number(parsed.matchScore ?? 0))),
    strengths: parsed.strengths ?? [],
    gaps: parsed.gaps ?? [],
    interviewQuestions: (parsed.interviewQuestions ?? []).map((q) => ({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      why: q.why,
    })),
    summary: parsed.summary ?? "",
    prepAdvice: parsed.prepAdvice ?? "",
  };
}
