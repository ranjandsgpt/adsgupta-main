import { prisma } from "./prisma";
import { generateLLMResponse, hasLlm } from "./llm";
import { ADTECH_KNOWLEDGE_BASE, INTERVIEW_SYSTEM_PROMPT } from "./adtech-knowledge";
import { generateId } from "./ids";
import type { Prisma } from "@prisma/client";

const skillPatterns: RegExp[] = [
  /programmatic/i,
  /dsp/i,
  /ssp/i,
  /header bidding/i,
  /prebid/i,
  /rtb/i,
  /google ad manager/i,
  /gam/i,
  /dfp/i,
  /dv360/i,
  /the trade desk/i,
  /amazon\s*(ads|dsp)/i,
  /yield optimization/i,
  /ad operations/i,
  /campaign management/i,
  /media buying/i,
  /\bsql\b/i,
  /\bpython\b/i,
  /excel/i,
  /tableau/i,
  /looker/i,
  /data analysis/i,
  /a\/b testing/i,
  /analytics/i,
  /facebook ads/i,
  /google ads/i,
  /\bppc\b/i,
  /\bsem\b/i,
  /\bseo\b/i,
  /\bcrm\b/i,
  /salesforce/i,
  /hubspot/i,
  /marketo/i,
  /\bapi\b/i,
  /javascript/i,
  /html/i,
];

export function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const p of skillPatterns) {
    const m = lower.match(p);
    if (m) found.add(m[0].toLowerCase());
  }
  return [...found];
}

export function detectFillerWords(text: string): { fillers: string[]; count: number } {
  const fillerPatterns = [
    /\bum+\b/gi,
    /\buh+\b/gi,
    /\bah+\b/gi,
    /\ber+\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bbasically\b/gi,
    /\bactually\b/gi,
    /\bi mean\b/gi,
    /\bkind of\b/gi,
    /\bsort of\b/gi,
    /\bi guess\b/gi,
  ];
  const textLower = text.toLowerCase();
  const foundFillers: string[] = [];
  let count = 0;
  for (const pattern of fillerPatterns) {
    const matches = textLower.match(pattern);
    if (matches) {
      foundFillers.push(...matches);
      count += matches.length;
    }
  }
  return { fillers: foundFillers, count };
}

export type AnalysisResult = {
  match_score: number;
  job_title: string;
  company: string;
  summary: string;
  skill_gaps: { skill: string; status: string; description: string; priority: string }[];
  interview_questions: { question: string; category: string; difficulty: string }[];
  action_items: string[];
  readiness_score: Record<string, number>;
  high_impact_swaps: string[];
  missing_keywords: string[];
};

export async function analyzeResumeJd(
  resumeText: string,
  jdText: string
): Promise<AnalysisResult> {
  const resumeSkills = extractSkillsFromText(resumeText);
  const jdSkills = extractSkillsFromText(jdText);
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s));
  const matched = jdSkills.filter((s) => resumeSkills.includes(s));

  let matchPercentage = 50;
  if (jdSkills.length > 0) {
    matchPercentage = Math.round((matched.length / jdSkills.length) * 100);
  }
  const matchScore = Math.max(35, Math.min(95, matchPercentage));

  let jobTitle = "Senior Programmatic Specialist";
  const company = "Target Company";
  const titlePatterns: [RegExp, string][] = [
    [/manager/i, "Manager"],
    [/director/i, "Director"],
    [/specialist/i, "Specialist"],
    [/analyst/i, "Analyst"],
    [/lead/i, "Lead"],
  ];
  for (const [re, suf] of titlePatterns) {
    if (re.test(jdText)) {
      jobTitle = `Ad Operations ${suf}`;
      break;
    }
  }

  let highImpactSwaps: string[] = [];
  let missingKeywords = missing.slice(0, 5);
  type LlmAnalysisJson = { high_impact_swaps?: string[]; missing_keywords?: string[]; summary?: string };
  let llmAnalysis: LlmAnalysisJson | null = null;

  if (hasLlm()) {
    const llmPrompt = `
Analyze this resume against the job description:

RESUME:
${resumeText.slice(0, 2000)}

JOB DESCRIPTION:
${jdText.slice(0, 2000)}

Provide:
1. Three specific "High-Impact Swaps" - exact phrases to change in the resume
2. Five missing keywords to add
3. A 2-sentence summary of fit

Format as JSON:
{"high_impact_swaps": ["swap1", "swap2", "swap3"], "missing_keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"], "summary": "..."}
`;
    const llmResponse = await generateLLMResponse(
      "You are an expert resume optimizer. Always respond with valid JSON.",
      llmPrompt,
      true
    );
    if (llmResponse) {
      try {
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          llmAnalysis = JSON.parse(jsonMatch[0]) as LlmAnalysisJson;
          if (llmAnalysis?.high_impact_swaps?.length) {
            highImpactSwaps = llmAnalysis.high_impact_swaps.slice(0, 3);
          }
          if (llmAnalysis?.missing_keywords?.length) {
            missingKeywords = llmAnalysis.missing_keywords.slice(0, 5);
          }
        }
      } catch {
        /* keep defaults */
      }
    }
  }

  if (!highImpactSwaps.length) {
    highImpactSwaps = [
      "Add quantifiable results: 'Managed campaigns' → 'Managed $2M+ campaigns achieving 35% ROAS improvement'",
      `Highlight missing skill: Add experience with ${missing[0] ?? "header bidding"}`,
      "Use action verbs: 'Was responsible for' → 'Drove' or 'Optimized' or 'Led'",
    ];
  }

  const skillGaps = jdSkills.slice(0, 6).map((skill) => {
    const status = resumeSkills.includes(skill) ? "match" : "gap";
    return {
      skill: skill.replace(/\b\w/g, (c) => c.toUpperCase()),
      status,
      description: `Experience with ${skill}`,
      priority: status === "match" ? "low" : "high",
    };
  });

  const interviewQuestions = ADTECH_KNOWLEDGE_BASE.slice(0, 4).map((cat) => ({
    question: cat.questions[0].q,
    category: cat.category,
    difficulty: cat.questions[0].difficulty,
  }));

  const summary =
    llmAnalysis?.summary ??
    `Based on your resume analysis, you have a ${matchScore}% match with this role. ` +
      `Key strengths: ${matched.slice(0, 3).join(", ") || "campaign management"}. ` +
      `Areas to strengthen: ${missing.slice(0, 3).join(", ") || "header bidding, yield optimization"}.`;

  return {
    match_score: matchScore,
    job_title: jobTitle,
    company,
    summary,
    skill_gaps: skillGaps,
    interview_questions: interviewQuestions,
    action_items: [
      `Add ${missing[0] ?? "header bidding"} experience to your resume`,
      "Quantify achievements with percentages and dollar amounts",
      "Practice explaining RTB auction mechanics",
      "Prepare 2-3 case studies of campaign optimizations you've led",
    ],
    readiness_score: {
      technical: matched.length > 3 ? 70 : 55,
      behavioral: 85,
      industry_knowledge: matched.some((s) => s.includes("programmatic")) ? 75 : 60,
      communication: 80,
    },
    high_impact_swaps: highImpactSwaps,
    missing_keywords: missingKeywords,
  };
}

export async function generateResumeBrief(resumeText: string, jdText: string) {
  let highImpactSwaps: string[] = [];
  let missingKeywords: string[] = [];
  let summary = "";

  if (hasLlm()) {
    const prompt = `
You are an expert resume optimizer for ad-tech/programmatic advertising roles.

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jdText.slice(0, 2000)}

Provide EXACTLY:
1. Three "High-Impact Swaps" - specific phrases to change (before → after)
2. Two critical missing keywords that MUST be added
3. A one-sentence summary

Format:
HIGH-IMPACT SWAPS:
1. [current phrase] → [improved phrase with metrics]
2. [current phrase] → [improved phrase with metrics]
3. [current phrase] → [improved phrase with metrics]

MISSING KEYWORDS:
1. [keyword]
2. [keyword]

SUMMARY: [one sentence]
`;
    const response = await generateLLMResponse(
      "You are a senior ad-tech recruiter optimizing resumes.",
      prompt
    );
    if (response) {
      const lines = response.split("\n");
      let inSwaps = false;
      let inKeywords = false;
      for (const raw of lines) {
        const line = raw.trim();
        if (line.toUpperCase().includes("HIGH-IMPACT SWAPS")) {
          inSwaps = true;
          inKeywords = false;
          continue;
        }
        if (line.toUpperCase().includes("MISSING KEYWORDS")) {
          inSwaps = false;
          inKeywords = true;
          continue;
        }
        if (line.toUpperCase().startsWith("SUMMARY")) {
          inSwaps = false;
          inKeywords = false;
          summary = line.replace(/^SUMMARY:\s*/i, "").trim();
          continue;
        }
        if (inSwaps && (line.includes("→") || line.includes("->"))) {
          highImpactSwaps.push(line.replace(/^\d+\.\s*/, ""));
        } else if (inKeywords && /^\d/.test(line)) {
          const kw = line.replace(/^\d+\.\s*/, "");
          if (kw) missingKeywords.push(kw);
        }
      }
    }
  }

  if (!highImpactSwaps.length) {
    highImpactSwaps = [
      "'Managed campaigns' → 'Managed $1.5M monthly ad spend achieving 42% ROAS improvement'",
      "'Worked on optimization' → 'Led yield optimization initiatives increasing CPMs by 28%'",
      "'Experience with DSPs' → 'Expert in DV360, The Trade Desk, and Amazon DSP with certified credentials'",
    ];
  }
  if (!missingKeywords.length) missingKeywords = ["header bidding", "Prebid.js"];
  if (!summary) {
    summary =
      "Your resume shows strong campaign management skills but needs more quantifiable metrics and technical depth in header bidding.";
  }

  return {
    high_impact_swaps: highImpactSwaps.slice(0, 3),
    missing_keywords: missingKeywords.slice(0, 2),
    summary,
  };
}

export async function startInterviewSession(userId: string, jobMatchId: string | null | undefined, mode: string) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser && userId.startsWith("guest_")) {
    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@guest.talentos.local`,
        name: "Guest",
        passwordHash: "guest_account_no_password",
        credits: 3,
      },
    });
  } else if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  let firstQuestion: string;
  let categoryName: string;
  if (mode === "adtech") {
    const category = ADTECH_KNOWLEDGE_BASE[0];
    firstQuestion = category.questions[0].q;
    categoryName = category.category;
  } else {
    firstQuestion = "Tell me about yourself and why you're interested in this role.";
    categoryName = "Introduction";
  }

  const sessionId = generateId("interview");
  const now = new Date().toISOString();
  const sessionDoc = {
    session_id: sessionId,
    user_id: userId,
    job_match_id: jobMatchId ?? null,
    mode,
    status: "active",
    transcript: [
      {
        role: "interviewer",
        content: `Welcome to your mock interview. Let's begin.\n\n${firstQuestion}`,
        category: categoryName,
        timestamp: now,
      },
    ],
    question_index: 0,
    created_at: now,
  };

  await prisma.interview.create({
    data: {
      id: sessionId,
      userId,
      analysisId: jobMatchId ?? null,
      persona: mode,
      status: "active",
      messages: {
        transcript: sessionDoc.transcript,
        question_index: 0,
        mode,
      } as Prisma.InputJsonValue,
    },
  });
  return {
    session_id: sessionId,
    first_question: firstQuestion,
    category: categoryName,
    mode,
  };
}

type TranscriptEntry = Record<string, unknown>;

export async function processInterviewMessage(sessionId: string, userMessage: string) {
  const session = await prisma.interview.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("NOT_FOUND");
  if (session.status === "completed") throw new Error("ALREADY_COMPLETED");

  const { fillers, count: fillerCount } = detectFillerWords(userMessage);
  const answerLower = userMessage.toLowerCase();

  const starScores = {
    situation: Math.min(
      100,
      Math.max(30, ["when", "at", "company", "team", "project"].filter((k) => answerLower.includes(k)).length * 20)
    ),
    task: Math.min(
      100,
      Math.max(
        25,
        ["responsible", "needed to", "goal", "objective"].filter((k) => answerLower.includes(k)).length * 20
      )
    ),
    action: Math.min(
      100,
      Math.max(
        40,
        ["i", "implemented", "created", "led", "built", "developed"].filter((k) => answerLower.includes(k)).length *
          15
      )
    ),
    result: Math.min(
      100,
      Math.max(20, ["result", "outcome", "increased", "improved", "%"].filter((k) => answerLower.includes(k)).length * 20)
    ),
  };

  const messages = (session.messages as { transcript?: TranscriptEntry[]; question_index?: number; mode?: string }) ?? {};
  const transcript = [...(messages.transcript ?? [])];
  transcript.push({
    role: "user",
    content: userMessage,
    star_scores: starScores,
    filler_count: fillerCount,
    timestamp: new Date().toISOString(),
  });

  const questionIndex = (messages.question_index ?? 0) + 1;
  const interviewMode = messages.mode ?? session.persona ?? "adtech";

  let responseContent: string;
  let categoryName: string;
  let status: string;

  if (questionIndex >= 5) {
    status = "completed";
    const overallScore = Math.round(
      (Object.values(starScores).reduce((a, b) => a + b, 0) / 4 + (100 - fillerCount * 5)) / 2
    );
    responseContent = `Thank you for completing this mock interview!

Here's your performance summary:
- STAR Method Score: ${Math.round(Object.values(starScores).reduce((a, b) => a + b, 0) / 4)}%
- Filler Words Used: ${fillerCount}
- Overall Score: ${overallScore}/100

Key feedback:
- ${starScores.result > 60 ? "Great structure using the STAR method!" : "Try to include more quantifiable results in your answers."}
- ${fillerCount > 3 ? "Watch out for filler words like 'um', 'like', 'basically'." : "Good control of speech patterns."}
`;
    categoryName = "Feedback";

    await prisma.interview.update({
      where: { id: sessionId },
      data: {
        status,
        scores: {
          star_scores: starScores,
          filler_count: fillerCount,
          overall_score: overallScore,
        } as Prisma.InputJsonValue,
        fillerWords: fillerCount,
        messages: {
          transcript,
          question_index: questionIndex,
          mode: interviewMode,
        } as Prisma.InputJsonValue,
      },
    });
  } else {
    let nextQ: string;
    if (interviewMode === "adtech" && questionIndex < ADTECH_KNOWLEDGE_BASE.length) {
      const category = ADTECH_KNOWLEDGE_BASE[questionIndex % ADTECH_KNOWLEDGE_BASE.length];
      nextQ = category.questions[0].q;
      categoryName = category.category;
    } else {
      nextQ = "Can you give me a specific example where you overcame a significant challenge?";
      categoryName = "Behavioral";
    }

    if (hasLlm() && starScores.result < 50) {
      const lastQ =
        transcript.length >= 2 ? String((transcript[transcript.length - 2] as { content?: string }).content ?? "") : "";
      const followUpPrompt = `
The candidate answered this question: "${lastQ}"
With this response: "${userMessage.slice(0, 500)}"

They didn't include quantifiable results. Generate a brief, probing follow-up question to get specific metrics.
Keep it under 30 words.
`;
      const followUp = await generateLLMResponse(INTERVIEW_SYSTEM_PROMPT, followUpPrompt);
      responseContent = followUp
        ? `Interesting. ${followUp}\n\nNext question:\n${nextQ}`
        : `Good. Can you quantify the impact of your actions?\n\nMoving on:\n${nextQ}`;
    } else {
      responseContent = `Thank you for that answer.\n\n${nextQ}`;
    }

    status = "active";
    transcript.push({
      role: "interviewer",
      content: responseContent,
      category: categoryName,
      timestamp: new Date().toISOString(),
    });

    await prisma.interview.update({
      where: { id: sessionId },
      data: {
        status,
        fillerWords: fillerCount,
        messages: {
          transcript,
          question_index: questionIndex,
          mode: interviewMode,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return {
    response: responseContent!,
    star_scores: starScores,
    filler_words: fillers,
    filler_count: fillerCount,
    status,
    question_index: questionIndex,
    category: categoryName!,
  };
}

export async function evaluateAnswer(question: string, answer: string) {
  const answerLower = answer.toLowerCase();
  const answerWords = answer.split(/\s+/).length;

  const score = (keywords: string[], base: number, per: number) =>
    Math.min(100, Math.max(base, keywords.filter((k) => answerLower.includes(k)).length * per));

  let situationScore = score(["when", "at", "company", "role", "project", "team", "client", "situation"], 30, 20);
  let taskScore = score(["responsible", "task", "goal", "objective", "needed to", "had to", "assigned"], 25, 20);
  let actionScore = score(
    ["i", "implemented", "created", "developed", "built", "analyzed", "optimized", "led"],
    40,
    15
  );
  let resultScore = score(["result", "outcome", "increased", "decreased", "improved", "achieved", "%", "revenue"], 20, 20);

  const lengthBonus = answerWords >= 150 && answerWords <= 300 ? 10 : 0;
  situationScore = Math.min(100, situationScore + lengthBonus);
  taskScore = Math.min(100, taskScore + lengthBonus);
  actionScore = Math.min(100, actionScore + lengthBonus);
  resultScore = Math.min(100, resultScore + lengthBonus);

  const { fillers, count: fillerCount } = detectFillerWords(answer);
  const feedbackParts: string[] = [];
  if (situationScore < 60) feedbackParts.push("Provide more context about the situation.");
  if (taskScore < 60) feedbackParts.push("Clarify your specific responsibility.");
  if (actionScore < 60) feedbackParts.push("Focus on the specific actions YOU took.");
  if (resultScore < 60) feedbackParts.push("Include quantifiable results.");
  if (fillerCount > 3) feedbackParts.push(`Reduce filler words (${fillerCount} detected).`);

  const feedback =
    feedbackParts.length > 0 ? feedbackParts.join(" ") : "Strong answer! You covered all STAR components well.";

  let followUp: string | null = null;
  if (hasLlm() && resultScore < 60) {
    followUp = await generateLLMResponse(
      "You are an ad-tech hiring manager. Keep response under 25 words.",
      `Generate a brief follow-up question to get specific metrics for this answer: '${answer.slice(0, 300)}...'`
    );
  }

  return {
    star_scores: {
      situation: situationScore,
      task: taskScore,
      action: actionScore,
      result: resultScore,
    },
    feedback,
    follow_up: followUp,
    filler_words: fillers,
    filler_count: fillerCount,
  };
}

export function listQuestions(category: string, difficulty: string) {
  const questions: { question: string; category: string; difficulty: string }[] = [];
  for (const cat of ADTECH_KNOWLEDGE_BASE) {
    if (category.toLowerCase() === "all" || cat.category.toLowerCase().includes(category.toLowerCase())) {
      for (const q of cat.questions) {
        if (difficulty === "all" || q.difficulty === difficulty) {
          questions.push({ question: q.q, category: cat.category, difficulty: q.difficulty });
        }
      }
    }
  }
  return { questions };
}

export async function deleteUserData(userId: string) {
  const [resumes, analyses, interviews, payments, savedJobs] = await Promise.all([
    prisma.resume.deleteMany({ where: { userId } }),
    prisma.analysis.deleteMany({ where: { userId } }),
    prisma.interview.deleteMany({ where: { userId } }),
    prisma.payment.deleteMany({ where: { userId } }),
    prisma.savedJob.deleteMany({ where: { userId } }),
  ]);
  await prisma.user.deleteMany({ where: { id: userId } });
  return {
    success: true,
    user_id: userId,
    deleted_counts: {
      resumes: resumes.count,
      analyses: analyses.count,
      interviews: interviews.count,
      payments: payments.count,
      saved_jobs: savedJobs.count,
    },
  };
}
