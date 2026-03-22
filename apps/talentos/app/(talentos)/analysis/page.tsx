"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Sparkles,
  Mic,
  MessageSquare,
  Zap,
  ChevronRight,
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

function SkillGapCard({
  skill,
  status,
  description,
  priority,
}: {
  skill: string;
  status: string;
  description: string;
  priority: string;
}) {
  const statusConfig: Record<
    string,
    { icon: typeof CheckCircle2; color: string; bg: string; label: string }
  > = {
    match: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Strong Match" },
    partial: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: "Partial Match" },
    gap: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Gap Identified" },
  };
  const config = statusConfig[status] ?? statusConfig.gap;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium truncate">{skill}</h4>
            {priority === "high" && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 uppercase">
                High Priority
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">{description}</p>
          <span className={`text-xs ${config.color} mt-2 inline-block`}>{config.label}</span>
        </div>
      </div>
    </motion.div>
  );
}

function InterviewQuestionCard({
  question,
  category,
  difficulty,
  index,
}: {
  question: string;
  category: string;
  difficulty: string;
  index: number;
}) {
  const difficultyConfig: Record<string, { color: string; bg: string }> = {
    easy: { color: "text-emerald-400", bg: "bg-emerald-500/20" },
    medium: { color: "text-amber-400", bg: "bg-amber-500/20" },
    hard: { color: "text-red-400", bg: "bg-red-500/20" },
  };
  const config = difficultyConfig[difficulty] ?? difficultyConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-white leading-relaxed mb-3">{question}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs bg-white/10 text-zinc-400">{category}</span>
            <span className={`px-2 py-1 rounded text-xs ${config.bg} ${config.color} capitalize`}>
              {difficulty}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

type Analysis = {
  match_score: number;
  job_title: string;
  company: string;
  summary: string;
  skill_gaps: { skill: string; status: string; description: string; priority: string }[];
  interview_questions: { question: string; category: string; difficulty: string }[];
  action_items: string[];
  readiness_score: Record<string, number>;
};

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("talentos_analysis");
    if (stored) {
      setAnalysis(JSON.parse(stored) as Analysis);
    } else {
      setAnalysis({
        match_score: 72,
        job_title: "Senior Programmatic Specialist",
        company: "Leading AdTech Company",
        summary:
          "You have strong foundational skills in programmatic advertising with notable experience in DSP operations. However, there are gaps in header bidding implementation and yield optimization that should be addressed before the interview.",
        skill_gaps: [
          { skill: "DSP Operations", status: "match", description: "Strong experience with The Trade Desk and DV360", priority: "low" },
          { skill: "Header Bidding", status: "gap", description: "Limited exposure to Prebid.js and multi-wrapper setups", priority: "high" },
          { skill: "RTB & Auction Logic", status: "partial", description: "Basic understanding, need deeper knowledge of second-price auctions", priority: "medium" },
          { skill: "Yield Optimization", status: "gap", description: "No demonstrated experience with floor price optimization", priority: "high" },
          { skill: "Data Analysis", status: "match", description: "Excellent SQL and analytics skills", priority: "low" },
          { skill: "Campaign Management", status: "match", description: "Proven track record of managing $1M+ campaigns", priority: "low" },
        ],
        interview_questions: [
          { question: "Walk me through how you would set up a header bidding wrapper with 8 demand partners while keeping latency under 500ms.", category: "Header Bidding", difficulty: "hard" },
          { question: "How do you measure the true incremental revenue of header bidding vs. waterfall?", category: "Yield Optimization", difficulty: "medium" },
          { question: "Explain the difference between first-price and second-price auctions. How does bid shading work?", category: "RTB", difficulty: "medium" },
          { question: "A client's CPM has dropped 30% month-over-month. Walk me through your debugging process.", category: "Troubleshooting", difficulty: "hard" },
          { question: "How would you structure a test to determine optimal floor prices across different ad units?", category: "Yield Optimization", difficulty: "hard" },
        ],
        action_items: [
          "Complete a Prebid.js tutorial and implement a test wrapper",
          "Study floor price optimization strategies and A/B testing methodologies",
          "Practice explaining RTB auction mechanics using concrete examples",
          "Prepare 2-3 case studies of campaign optimizations you've led",
        ],
        readiness_score: {
          technical: 68,
          behavioral: 85,
          industry_knowledge: 72,
          communication: 80,
        },
      });
    }
    setLoading(false);
  }, []);

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
          <p className="text-zinc-400 mb-6">Please upload your resume and job description first.</p>
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
            href="/interview"
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
              <CircularProgress value={analysis.match_score} size={140} />
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-3">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-cyan-400 text-sm">AI Analysis Complete</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-space)] mb-2">
                  {analysis.job_title}
                </h1>
                <p className="text-zinc-400 mb-4">{analysis.company}</p>
                <p className="text-zinc-300 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
              {Object.entries(analysis.readiness_score).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-cyan-500" : value >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                  <p className="text-white font-semibold">{value}%</p>
                  <p className="text-zinc-500 text-xs capitalize">{key.replace('_', ' ')}</p>
                </div>
              ))}
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
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Target size={20} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Skill Gap Analysis</h2>
                  <p className="text-zinc-500 text-sm">{analysis.skill_gaps.length} skills analyzed</p>
                </div>
              </div>
              <div className="space-y-3">
                {analysis.skill_gaps.map((gap, index) => (
                  <SkillGapCard key={index} {...gap} />
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
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <MessageSquare size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Likely Interview Questions</h2>
                  <p className="text-zinc-500 text-sm">Based on your gaps and the JD</p>
                </div>
              </div>
              <div className="space-y-3">
                {analysis.interview_questions.map((q, index) => (
                  <InterviewQuestionCard key={index} {...q} index={index} />
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Action Plan</h2>
                <p className="text-zinc-500 text-sm">Complete these before your interview</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.action_items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-zinc-300 text-sm">{item}</p>
                </motion.div>
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
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
              data-testid="start-mock-interview-btn"
            >
              <Mic size={20} />
              Start Mock Interview
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
