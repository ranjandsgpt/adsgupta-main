"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  Compass,
  FileText,
  HelpCircle,
  Mic,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  type LucideIcon,
} from "lucide-react";
import { PLANS } from "@/lib/plans";

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c >= value ? value : c + Math.ceil(value / 40))), 45);
    return () => clearInterval(id);
  }, [value]);

  return <span>{Math.min(count, value).toLocaleString()}{suffix}</span>;
};

export default function HomePage() {
  const featureCards: Array<{ title: string; desc: string; icon: LucideIcon }> = [
    { title: "Resume Intelligence", desc: "AI parses your resume, identifies strengths and gaps", icon: FileText },
    { title: "Mock Interviews", desc: "4 AI personas: Recruiter, Hiring Manager, Technical Peer, Bar Raiser", icon: Mic },
    { title: "STAR Scoring", desc: "Real-time feedback on Situation, Task, Action, Result", icon: Star },
    { title: "Company Intel", desc: "Know what to expect before you walk in", icon: Building2 },
    { title: "Prep Guides", desc: "Personalized study plans, story templates, cheat sheets", icon: Compass },
    { title: "Smart Job Search", desc: "AI-ranked job matches across 10+ countries", icon: Briefcase },
  ];

  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          router.replace("/dashboard");
          return;
        }
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [router]);

  if (!authChecked) {
    return <div className="min-h-screen bg-[#050505]" />;
  }

  const stats = [
    { value: 10000, suffix: "+", label: "analyses run" },
    { value: 4, suffix: "", label: "AI interviewers" },
    { value: 20, suffix: "+", label: "countries supported" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full" />
      </div>

      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[length:4rem_4rem] pointer-events-none" />

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-space)] text-white">TalentOS</span>
              <span className="text-xs text-zinc-500 block">by AdsGupta</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm">
              Features
            </a>
            <a href="#how" className="text-zinc-400 hover:text-white transition-colors text-sm">
              How it Works
            </a>
            <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors text-sm px-4 py-2">
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
              data-testid="get-started-btn"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Sparkles size={14} className="text-cyan-400" />
                <span className="text-zinc-400 text-sm">AI Career Intelligence</span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-space)] tracking-tight mb-6">
                Your AI Career Intelligence Platform
              </h1>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Resume analysis, mock interviews with AI personas, personalized prep guides, and smart job matching - powered by AI that actually reads your resume.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold inline-flex items-center gap-2">
                  Start Free Analysis <ArrowRight size={17} />
                </Link>
                <a href="#" className="px-7 py-3 rounded-xl border border-white/15 text-zinc-200 inline-flex items-center gap-2">
                  <PlayCircle size={17} /> Watch Demo
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
                    <p className="text-xs text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-5 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 blur-3xl rounded-full" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
                <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-zinc-300 text-sm">AI Persona: Hiring Manager</p>
                    <p className="text-white mt-1">Tell me about a project where you had to influence a tough stakeholder.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-zinc-300 text-sm">Match Score</p>
                    <p className="text-cyan-300 text-2xl font-semibold mt-1">84%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-zinc-300 text-sm">Next Best Action</p>
                    <p className="text-white mt-1">Practice leadership STAR stories for Product Manager interviews.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative py-20 px-6 border-y border-white/5 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: FileText, title: "Upload Resume & JD", desc: "Add your resume and target role description." },
              { icon: Target, title: "AI Analyzes Your Fit", desc: "Get strengths, gaps, and smart recommendations." },
              { icon: Mic, title: "Practice with AI Interviewers", desc: "Run realistic rounds with persona-driven prompts." },
              { icon: Briefcase, title: "Get Hired", desc: "Apply to ranked jobs and show up interview-ready." },
            ].map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5 relative">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3"><s.icon size={18} /></div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-zinc-400 text-sm">{s.desc}</p>
                {i < 3 ? <ArrowRight size={14} className="hidden md:block absolute -right-3 top-1/2 text-zinc-500" /> : null}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {featureCards.map(({ title, desc, icon: Icon }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Built for Every Career</h2>
          <p className="text-zinc-400 text-center mb-8">Whether you're a first-time job seeker or a VP, TalentOS adapts to your career.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Software Engineer", "Product Manager", "Content Strategist", "Data Scientist", "Marketing Lead", "Operations Manager", "Designer", "Sales Executive"].map((role) => (
              <div key={role} className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4 text-sm text-zinc-200">{role}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5">
              <h3 className="font-semibold mb-2">{PLANS.free.name}</h3>
              <p className="text-3xl font-bold mb-3">$0</p>
              <ul className="space-y-1 text-sm text-zinc-300">{PLANS.free.features.map((f) => <li key={f}>- {f}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent p-5">
              <h3 className="font-semibold mb-2">{PLANS.pro.name}</h3>
              <p className="text-3xl font-bold mb-3">₹{PLANS.pro.priceINR}/mo</p>
              <ul className="space-y-1 text-sm text-zinc-200">{PLANS.pro.features.slice(0, 6).map((f) => <li key={f}>- {f}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5">
              <h3 className="font-semibold mb-2">{PLANS.enterprise.name}</h3>
              <p className="text-3xl font-bold mb-3">{String(PLANS.enterprise.price)}</p>
              <ul className="space-y-1 text-sm text-zinc-300">{PLANS.enterprise.features.map((f) => <li key={f}>- {f}</li>)}</ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold">Start Free <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section id="faq" className="relative py-20 px-6 border-y border-white/5 bg-black/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              ["What makes TalentOS different from ChatGPT?", "Structured interview simulation, STAR scoring, persona-based practice, and company intelligence. Not a generic chatbot."],
              ["Does it work for non-tech roles?", "Yes, TalentOS works across industries and role types."],
              ["Which countries are supported?", "Job search supports US, UK, India, Australia, Germany, France, Japan, and more."],
              ["Is my data safe?", "Your resume is encrypted and never shared."],
              ["Can I cancel my subscription?", "Yes, you can cancel anytime."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5">
                <p className="font-semibold flex items-center gap-2"><HelpCircle size={16} className="text-cyan-300" /> {q}</p>
                <p className="text-zinc-400 mt-2">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to ace your next interview?</h2>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
