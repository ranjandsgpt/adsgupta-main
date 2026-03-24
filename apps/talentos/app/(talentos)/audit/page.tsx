"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type AuditResult = {
  overallScore: number;
  atsScore: number;
  sections: Array<{ name: string; score: number; feedback: string }>;
  topIssues: string[];
  quickWins: string[];
};

type LinkedInResult = {
  headline: string;
  about: string;
  experienceBullets: string[];
  skills: string[];
  featuredIdeas: string[];
};

type NaukriResult = {
  profileSummary: string;
  keySkills: string[];
  careerObjective: string;
  noticePeriodSuggestion: string;
  expectedSalaryTalkingPoints: string[];
};

type ActionType = "audit" | "rewrite" | "linkedin" | "naukri";

const ACTIONS: Array<{
  id: ActionType | "analyze";
  title: string;
  subtitle: string;
  description: string;
}> = [
  { id: "audit", title: "Audit Resume", subtitle: "Get a score and ATS tips", description: "Get a score, gaps, and ATS optimization suggestions." },
  { id: "rewrite", title: "Rewrite Resume", subtitle: "Stronger achievements", description: "AI rewrites your resume to be clearer and stronger." },
  { id: "linkedin", title: "LinkedIn Profile", subtitle: "Full profile draft", description: "Generate your complete LinkedIn profile sections." },
  { id: "naukri", title: "Naukri Profile", subtitle: "Naukri-ready profile", description: "Generate your Naukri.com profile content." },
  { id: "analyze", title: "Analyze Match", subtitle: "Compare against a JD", description: "Paste a job description and run full match analysis." },
];

export default function AuditPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [rewriteText, setRewriteText] = useState("");
  const [linkedinResult, setLinkedinResult] = useState<LinkedInResult | null>(null);
  const [naukriResult, setNaukriResult] = useState<NaukriResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const canRunActions = useMemo(() => Boolean(resumeFile), [resumeFile]);

  async function callResumeTool(action: ActionType) {
    if (!resumeFile) {
      setStatusMessage("Upload your resume first.");
      return;
    }
    setLoadingAction(action);
    setStatusMessage("AI is analyzing your resume...");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const routeMap: Record<ActionType, string> = {
        audit: "/api/talentos/audit-resume",
        rewrite: "/api/talentos/rewrite-resume",
        linkedin: "/api/talentos/linkedin-profile",
        naukri: "/api/talentos/naukri-profile",
      };
      const response = await fetch(routeMap[action], { method: "POST", body: formData });
      const data = (await response.json()) as unknown;

      if (action === "audit") setAuditResult(data as AuditResult);
      if (action === "rewrite") setRewriteText((data as { rewrittenText?: string }).rewrittenText ?? "AI rewrite is temporarily unavailable.");
      if (action === "linkedin") setLinkedinResult(data as LinkedInResult);
      if (action === "naukri") setNaukriResult(data as NaukriResult);

      setStatusMessage("Done.");
    } catch {
      setStatusMessage("AI is temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoadingAction(null);
    }
  }

  function copyText(text: string) {
    void navigator.clipboard.writeText(text || "");
    setStatusMessage("Copied to clipboard.");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-zinc-300">
            <span className="text-cyan-400" aria-hidden>*</span>
            Resume Tools Hub
          </div>
          <h1 className="text-3xl font-bold mt-4">Audit, Rewrite, and Optimize Your Resume</h1>
          <p className="text-zinc-400 mt-2">Upload once, then run multiple AI tools instantly.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-8">
          <div className="flex items-center gap-2 mb-4 text-zinc-300">
            <span aria-hidden>[ ]</span> Step 1: Upload resume (PDF/DOCX)
          </div>
          <label className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition border-white/15 hover:border-white/30 bg-white/5 block">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
            <p className="font-medium">{resumeFile ? resumeFile.name : "Choose your resume file"}</p>
            <p className="text-sm text-zinc-500 mt-2">PDF or DOCX only</p>
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-8">
          <div className="flex items-center gap-2 mb-5 text-zinc-300">
            <span aria-hidden>{"->"}</span> Step 2: Choose what to do
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTIONS.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ y: -2 }}
                type="button"
                onClick={() => {
                  if (action.id === "analyze") {
                    router.push("/workspace");
                    return;
                  }
                  void callResumeTool(action.id);
                }}
                disabled={!canRunActions || loadingAction !== null}
                className="text-left rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 disabled:opacity-50"
              >
                <p className="font-semibold">{action.title}</p>
                <p className="text-cyan-300 text-sm mt-1">{action.subtitle}</p>
                <p className="text-zinc-400 text-sm mt-2">{action.description}</p>
              </motion.button>
            ))}
          </div>
          <div className="mt-4 min-h-6 text-sm text-zinc-400 flex items-center gap-2">
            {loadingAction ? <span className="animate-spin inline-block">o</span> : <span aria-hidden>AI</span>}
            <span>{statusMessage || "Ready when you are."}</span>
          </div>
        </div>

        {auditResult ? (
          <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 inline-flex items-center gap-2"><span aria-hidden>O</span> Resume Audit</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl bg-white/5 p-4">Overall Score: <span className="text-cyan-300 font-bold">{auditResult.overallScore}</span></div>
              <div className="rounded-xl bg-white/5 p-4">ATS Score: <span className="text-emerald-300 font-bold">{auditResult.atsScore}</span></div>
            </div>
            <div className="space-y-3 mb-4">
              {auditResult.sections?.map((section, idx) => (
                <div key={`${section.name}-${idx}`} className="rounded-xl bg-white/5 p-3">
                  <p className="font-medium">{section.name} - {section.score}/100</p>
                  <p className="text-zinc-400 text-sm mt-1">{section.feedback}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="font-medium mb-2">Top Issues</p>
                <ul className="text-sm text-zinc-300 space-y-1">{(auditResult.topIssues ?? []).map((x, i) => <li key={`i-${i}`}>- {x}</li>)}</ul>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="font-medium mb-2">Quick Wins</p>
                <ul className="text-sm text-zinc-300 space-y-1">{(auditResult.quickWins ?? []).map((x, i) => <li key={`w-${i}`}>- {x}</li>)}</ul>
              </div>
            </div>
          </section>
        ) : null}

        {rewriteText ? (
          <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Rewritten Resume</h2>
            <textarea value={rewriteText} readOnly className="w-full h-64 rounded-xl bg-white/5 border border-white/10 p-4" />
            <button type="button" onClick={() => copyText(rewriteText)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">
              <span aria-hidden>[]</span> Copy to clipboard
            </button>
          </section>
        ) : null}

        {linkedinResult ? (
          <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 inline-flex items-center gap-2"><span aria-hidden>in</span> LinkedIn Profile</h2>
            {[
              ["Headline", linkedinResult.headline],
              ["About", linkedinResult.about],
              ["Experience Bullets", linkedinResult.experienceBullets.join("\n")],
              ["Skills", linkedinResult.skills.join(", ")],
              ["Featured Ideas", linkedinResult.featuredIdeas.join("\n")],
            ].map(([label, text]) => (
              <div key={label} className="mb-4 rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{label}</p>
                  <button type="button" onClick={() => copyText(text)} className="text-xs text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"><span aria-hidden>[]</span> Copy</button>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{text}</p>
              </div>
            ))}
          </section>
        ) : null}

        {naukriResult ? (
          <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
            <h2 className="text-xl font-semibold mb-4">Naukri Profile</h2>
            {[
              ["Profile Summary", naukriResult.profileSummary],
              ["Key Skills", naukriResult.keySkills.join(", ")],
              ["Career Objective", naukriResult.careerObjective],
              ["Notice Period Suggestion", naukriResult.noticePeriodSuggestion],
              ["Expected Salary Talking Points", naukriResult.expectedSalaryTalkingPoints.join("\n")],
            ].map(([label, text]) => (
              <div key={label} className="mb-4 rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{label}</p>
                  <button type="button" onClick={() => copyText(text)} className="text-xs text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"><span aria-hidden>[]</span> Copy</button>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{text}</p>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
