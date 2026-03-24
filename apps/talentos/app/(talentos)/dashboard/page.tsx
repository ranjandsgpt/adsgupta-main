"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, FileText, Mic, TrendingUp } from "@/components/icons";

type DashboardPayload = {
  user: { name?: string; email: string; currentRole?: string; targetRole?: string; isSubscribed: boolean; credits: number };
  stats: {
    totalAnalyses: number;
    totalInterviews: number;
    averageMatchScore: number;
    averageInterviewScore: number;
    readinessLevel: string;
    interviewsThisWeek: number;
    improvementTrend: "improving" | "stable" | "declining";
  };
  recentActivity: Array<{ type: string; title: string; date: string; score: number }>;
  savedJobs: number;
  upcomingPrepTopics: string[];
  resumes: Array<{ id: string; fileName: string; version: string; createdAt: string }>;
  savedJobsPreview: Array<{ id: string; title: string; company: string; matchScore?: number | null }>;
};

function ReadinessDial({ score }: { score: number }) {
  const radius = 58;
  const c = 2 * Math.PI * radius;
  const o = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative w-40 h-40">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#grad)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: o }}
          transition={{ duration: 1 }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{score}%</div>
        <div className="text-xs text-zinc-400">Readiness</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = (await res.json()) as DashboardPayload;
      setData(json);
      setLoading(false);
    })();
  }, [router]);

  const readinessScore = useMemo(() => {
    if (!data) return 0;
    return Math.round((data.stats.averageMatchScore + data.stats.averageInterviewScore) / 2);
  }, [data]);

  if (loading || !data) {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome back {data.user.name || "there"}</h1>
            <p className="text-zinc-400 mt-2">{data.stats.readinessLevel} - keep building momentum.</p>
          </div>
          <ReadinessDial score={readinessScore} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="text-zinc-400 text-sm">Total Analyses</div><div className="text-2xl font-semibold">{data.stats.totalAnalyses}</div></div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="text-zinc-400 text-sm">Total Interviews</div><div className="text-2xl font-semibold">{data.stats.totalInterviews}</div></div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="text-zinc-400 text-sm">Avg Match Score</div><div className="text-2xl font-semibold">{data.stats.averageMatchScore}%</div></div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="text-zinc-400 text-sm">Trend</div><div className="text-2xl font-semibold capitalize">{data.stats.improvementTrend}</div></div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/workspace" className="p-4 rounded-xl bg-white/5 hover:bg-white/10"><FileText size={18} className="mb-2" />New Analysis</Link>
            <Link href="/interview" className="p-4 rounded-xl bg-white/5 hover:bg-white/10"><Mic size={18} className="mb-2" />Practice Interview</Link>
            <Link href="/jobs" className="p-4 rounded-xl bg-white/5 hover:bg-white/10"><Briefcase size={18} className="mb-2" />Search Jobs</Link>
            <Link href="/prep" className="p-4 rounded-xl bg-white/5 hover:bg-white/10"><TrendingUp size={18} className="mb-2" />Prep Guide</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {data.recentActivity.map((item, i) => (
                <div key={`${item.type}-${i}`} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-zinc-500">{new Date(item.date).toLocaleString()}</p>
                  </div>
                  <span className="text-cyan-300 text-sm">{item.score || "-"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
            <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
            <div className="space-y-3">
              {data.resumes.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm">{r.fileName}</p>
                    <p className="text-xs text-zinc-500">{r.version} - {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link href="/workspace" className="text-cyan-300 text-sm flex items-center gap-1">Use <ArrowRight size={12} /></Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
            <h2 className="text-xl font-semibold mb-4">Saved Jobs</h2>
            <div className="space-y-3">
              {data.savedJobsPreview.map((j) => (
                <div key={j.id} className="p-3 rounded-lg bg-white/5">
                  <p className="text-sm">{j.title}</p>
                  <p className="text-xs text-zinc-500">{j.company} {j.matchScore ? `- ${j.matchScore}%` : ""}</p>
                </div>
              ))}
              {data.savedJobsPreview.length === 0 ? <p className="text-zinc-500 text-sm">No saved jobs yet.</p> : null}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Prep Topics</h2>
            <ul className="space-y-2">
              {data.upcomingPrepTopics.map((t, i) => (
                <li key={i} className="text-sm text-zinc-300">- {t}</li>
              ))}
              {data.upcomingPrepTopics.length === 0 ? <li className="text-zinc-500 text-sm">Generate a prep guide to see topics.</li> : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
