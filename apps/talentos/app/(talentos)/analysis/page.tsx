"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  AlertTriangle,
  ArrowRight,
  Bot,
  Sparkles,
  Mic,
  Briefcase,
} from "lucide-react";

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorMap = {
    emerald: { stroke: "stroke-emerald-500", text: "text-emerald-400" },
    cyan: { stroke: "stroke-cyan-500", text: "text-cyan-400" },
    amber: { stroke: "stroke-amber-500", text: "text-amber-400" },
    red: { stroke: "stroke-red-500", text: "text-red-400" },
  };

  const getColor = () => {
    if (value >= 80) return colorMap.emerald;
    if (value >= 60) return colorMap.cyan;
    if (value >= 40) return colorMap.amber;
    return colorMap.red;
  };
  const colors = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={`text-3xl font-bold ${colors.text} font-[family-name:var(--font-space)]`}>{value}%</span>
        <span className="text-zinc-500 text-xs">Match</span>
      </div>
    </div>
  );
}

type Question = {
  question: string;
  category: string;
  difficulty: string;
  why?: string;
};

type Analysis = {
  id: string;
  roleName: string;
  companyName: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  interviewQuestions: Question[];
  summary: string;
};

export default function AnalysisPage() {
  const [analysisId, setAnalysisId] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAnalysisId(params.get("id") ?? "");
  }, []);

  useEffect(() => {
    (async () => {
      if (!analysisId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/talentos/analysis/${analysisId}`);
        if (!res.ok) throw new Error("Failed to load analysis");
        const data = (await res.json()) as Analysis;
        setAnalysis(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId]);

  const questionsByCategory = useMemo(() => {
    const grouped: Record<string, Question[]> = {};
    for (const q of analysis?.interviewQuestions ?? []) {
      if (!grouped[q.category]) grouped[q.category] = [];
      grouped[q.category].push(q);
    }
    return grouped;
  }, [analysis]);

  const gapBars = useMemo(() => {
    const strengths = analysis?.strengths.length ?? 0;
    const gaps = analysis?.gaps.length ?? 0;
    const total = Math.max(strengths + gaps, 1);
    const aligned = Math.round((strengths / total) * 100);
    const missing = 100 - aligned;
    return { aligned, missing };
  }, [analysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-cyan-500/20 flex items-center justify-center animate-pulse">
            <Brain size={32} className="text-cyan-400" />
          </div>
          <p className="text-white font-medium">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Analysis Found</h2>
          <p className="text-zinc-400 mb-6">{error || "Please upload your resume and job description first."}</p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
          >
            Start Analysis
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[length:4rem_4rem] pointer-events-none" />

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-space)] text-white">TalentOS</span>
          </Link>

          <Link
            href={`/interview?analysisId=${analysis.id}`}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
            data-testid="start-interview-btn"
          >
            <Mic size={16} />
            Start Mock Interview
          </Link>
        </div>
      </nav>

      <main className="relative pt-8 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <CircularProgress value={analysis.matchScore} size={140} />
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-3">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-cyan-400 text-sm">AI Analysis Complete</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-space)] mb-2">
                  {analysis.roleName}
                </h1>
                <p className="text-zinc-400 mb-4">{analysis.companyName}</p>
                <p className="text-zinc-300 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-zinc-400 text-sm mb-2">Skill Gap Analysis</p>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${gapBars.aligned}%` }} />
                </div>
                <p className="text-emerald-400 text-xs mt-2">Aligned: {gapBars.aligned}%</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Missing Coverage</p>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${gapBars.missing}%` }} />
                </div>
                <p className="text-amber-400 text-xs mt-2">Gap: {gapBars.missing}%</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Strengths</h2>
                  <p className="text-zinc-500 text-sm">Evidence-backed positives from resume</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.strengths.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Gaps</h2>
                  <p className="text-zinc-500 text-sm">Skills and experiences to improve</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.gaps.map((g, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 mt-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Mic size={20} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Interview Questions</h2>
                <p className="text-zinc-500 text-sm">Grouped by category</p>
              </div>
            </div>
            <div className="space-y-5">
              {Object.entries(questionsByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">{category}</h3>
                  <div className="space-y-2">
                    {items.map((q, i) => (
                      <div key={`${category}-${i}`} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-white mb-2">{q.question}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded bg-white/10 text-zinc-300">{q.difficulty}</span>
                          {q.why ? <span className="text-zinc-500">{q.why}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-zinc-400 mb-4">Ready to practice?</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={`/interview?analysisId=${analysis.id}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
              data-testid="start-mock-interview-btn"
            >
              <Mic size={20} />
              Start Mock Interview
              <ArrowRight size={20} />
            </Link>
            <Link
              href={`/jobs?role=${encodeURIComponent(analysis.roleName)}`}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-all"
            >
              <Briefcase size={18} />
              Search Related Jobs
            </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
