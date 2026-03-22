"use client";

/**
 * TalentOS Landing — port of TalentOSLanding.jsx (footer removed; shared Footer in layout)
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  FileText,
  Mic,
  Target,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Play,
  TrendingUp,
  Bot,
} from "lucide-react";

const GlowingBorder = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
    <div className="relative bg-[#0A0A0A] rounded-2xl">{children}</div>
  </div>
);

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const BentoCard = ({
  icon: Icon,
  title,
  description,
  gradient,
  size = "normal",
  delay = 0,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  gradient: string;
  size?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className={`relative overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 hover:border-white/10 transition-all group ${
      size === "large" ? "md:col-span-2 md:row-span-2" : ""
    } ${size === "wide" ? "md:col-span-2" : ""}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

    <div className="relative z-10">
      <div
        className={`w-12 h-12 rounded-xl ${gradient.replace("bg-gradient-to-br", "bg-gradient-to-r")} bg-opacity-20 flex items-center justify-center mb-4`}
      >
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-white font-[family-name:var(--font-space)] mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>

    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  </motion.div>
);

export default function HomePage() {
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "AI Gap Analysis",
      description:
        "Upload your resume and paste a job description. Our AI identifies skill gaps and creates a personalized improvement roadmap.",
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
      size: "large",
    },
    {
      icon: Mic,
      title: "Live Mock Interviews",
      description:
        "Real-time AI interviewer with voice recognition. Get recursive follow-up questions like a senior hiring manager.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      size: "normal",
    },
    {
      icon: Star,
      title: "STAR Method Grading",
      description: "Every answer scored on Situation, Task, Action, Result framework with visual progress.",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      size: "normal",
    },
    {
      icon: Target,
      title: "Ad-Tech Specialization",
      description:
        "Focused training for DSP, SSP, Programmatic, and Header Bidding roles. Industry-specific question banks.",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      size: "wide",
    },
    {
      icon: FileText,
      title: "Resume Optimizer",
      description: "AI rewrites your resume to match job requirements. ATS-friendly formatting.",
      gradient: "bg-gradient-to-br from-rose-500 to-red-600",
      size: "normal",
    },
    {
      icon: TrendingUp,
      title: "Readiness Score",
      description: "Track your interview readiness with a dynamic score that improves as you practice.",
      gradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
      size: "normal",
    },
  ];

  const stats = [
    { value: 15000, suffix: "+", label: "Interviews Practiced" },
    { value: 94, suffix: "%", label: "Success Rate" },
    { value: 500, suffix: "+", label: "Companies Covered" },
    { value: 4.9, suffix: "/5", label: "User Rating" },
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
            <a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors text-sm">
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
              href="/workspace"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
              data-testid="get-started-btn"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span className="text-zinc-400 text-sm">AI-Powered Career Acceleration</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-space)] tracking-tight mb-6"
            >
              <span className="text-white">Your AI</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Interview Coach
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Upload your resume. Paste a job description. Get AI-powered gap analysis, practice with a live mock
              interviewer, and land your dream ad-tech role.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/workspace"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg overflow-hidden"
                data-testid="hero-cta-btn"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Analysis
                  <ArrowRight size={20} className={`transition-transform ${isHovering ? "translate-x-1" : ""}`} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <button
                type="button"
                className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                <Play size={18} />
                Watch Demo
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 relative"
          >
            <GlowingBorder className="max-w-5xl mx-auto">
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Bot size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">AI Interviewer</p>
                        <p className="text-zinc-500 text-sm">Senior Hiring Manager Mode</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-zinc-300 leading-relaxed">
                        &quot;You mentioned experience with Header Bidding. Can you walk me through how you&apos;d handle
                        latency issues in a multi-wrapper setup with 10+ demand partners?&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-3/4 h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
                      </div>
                      <span className="text-zinc-500 text-sm">Recording...</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-zinc-400 text-sm uppercase tracking-wider">STAR Method Score</p>

                    {["Situation", "Task", "Action", "Result"].map((item, index) => (
                      <div key={item} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">{item}</span>
                          <span className="text-white font-mono">{[85, 72, 90, 68][index]}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${[85, 72, 90, 68][index]}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              index === 0
                                ? "bg-cyan-500"
                                : index === 1
                                  ? "bg-blue-500"
                                  : index === 2
                                    ? "bg-purple-500"
                                    : "bg-pink-500"
                            }`}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Overall Score</span>
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                          79/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlowingBorder>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 border-y border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-space)]">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-zinc-500 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-space)] mb-4">
              Everything You Need to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Ace Your Interview
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <BentoCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-24 px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
                Ad-Tech Specialists
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-space)] mb-6">
                Built for Programmatic Professionals
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Our AI interviewer is trained on thousands of real ad-tech interviews. From DSP optimization to header
                bidding architecture, we&apos;ve got you covered.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "DSP/SSP Operations",
                  "Header Bidding",
                  "Programmatic Buying",
                  "Ad Operations",
                  "RTB & Auction Logic",
                  "Yield Optimization",
                ].map((topic) => (
                  <div key={topic} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-400" />
                    <span className="text-zinc-300 text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <GlowingBorder>
                <div className="p-6 space-y-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Sample Question</p>
                  <p className="text-white text-lg leading-relaxed">
                    &quot;In a waterfall vs. header bidding setup, how would you measure the true incremental revenue gain
                    while accounting for latency impact on user experience?&quot;
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">Yield Optimization</span>
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">Advanced</span>
                  </div>
                </div>
              </GlowingBorder>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-space)] mb-6">
              Ready to Land Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Dream Role?
              </span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10">Start your free analysis today. No credit card required.</p>

            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all"
              data-testid="cta-bottom-btn"
            >
              Start Free Analysis
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
