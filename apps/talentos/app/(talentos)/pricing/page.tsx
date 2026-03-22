"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Bot,
  Crown,
  Zap,
  Shield,
  Clock,
  Brain,
  Target,
  Briefcase,
  Mic,
  Loader2,
  AlertCircle,
} from "lucide-react";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PlanFeature({ included, text }: { included: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${included ? "text-zinc-300" : "text-zinc-500"}`}>
      {included ? <Check size={16} className="text-emerald-400 flex-shrink-0" /> : <X size={16} className="text-zinc-600 flex-shrink-0" />}
      {text}
    </li>
  );
}

function PricingCard({
  plan,
  isPopular,
  onSelect,
  isLoading,
}: {
  plan: { type: string; name: string; description: string; amount: number };
  isPopular: boolean;
  onSelect: (t: string) => void;
  isLoading: boolean;
}) {
  const features: Record<string, { text: string; included: boolean }[]> = {
    free: [
      { text: "3 Resume Analyses", included: true },
      { text: "1 Mock Interview", included: true },
      { text: "Basic STAR Scoring", included: true },
      { text: "Job Discovery", included: true },
      { text: "AI Resume Brief", included: false },
      { text: "Unlimited Interviews", included: false },
      { text: "Priority Support", included: false },
    ],
    pro_monthly: [
      { text: "Unlimited Resume Analyses", included: true },
      { text: "Unlimited Mock Interviews", included: true },
      { text: "Advanced STAR Scoring", included: true },
      { text: "Job Discovery + Alerts", included: true },
      { text: "AI Resume Brief & Optimizer", included: true },
      { text: "Filler Word Detection", included: true },
      { text: "Priority Support", included: true },
    ],
    pro_yearly: [
      { text: "Everything in Pro Monthly", included: true },
      { text: "2 Months Free", included: true },
      { text: "AI Video Persona (Beta)", included: true },
      { text: "LinkedIn Profile Sync", included: true },
      { text: "1-on-1 Career Coaching Call", included: true },
      { text: "Resume Review by Expert", included: true },
      { text: "Lifetime Updates", included: true },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-2xl border ${
        isPopular ? "bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/30" : "bg-[#0A0A0A] border-white/5"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-zinc-500 text-sm">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">
          {plan.amount === 0 ? "Free" : `₹${(plan.amount / 100).toLocaleString()}`}
        </span>
        {plan.amount > 0 && (
          <span className="text-zinc-500 text-sm ml-1">/{plan.type === "pro_yearly" ? "year" : "month"}</span>
        )}
      </div>
      <ul className="space-y-3 mb-6">
        {(features[plan.type] ?? []).map((feature, i) => (
          <PlanFeature key={i} {...feature} />
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onSelect(plan.type)}
        disabled={isLoading || plan.amount === 0}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isPopular
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            : plan.amount === 0
              ? "bg-white/5 text-zinc-500 cursor-default"
              : "bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : plan.amount === 0 ? (
          "Current Plan"
        ) : (
          <>
            <Zap size={18} />
            Get Started
          </>
        )}
      </button>
    </motion.div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [pricing, setPricing] = useState<Record<string, { amount: number }> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [userStatus, setUserStatus] = useState<{ is_pro?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((res) => res.json())
      .then((data: { pricing?: Record<string, { amount: number }> }) => setPricing(data.pricing ?? null))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("talentos_user_id");
    if (userId) {
      fetch(`/api/payments/status/${userId}`)
        .then((res) => res.json())
        .then((data) => setUserStatus(data))
        .catch(console.error);
    }
  }, []);

  const handleSelectPlan = async (planType: string) => {
    if (planType === "free") return;
    setSelectedPlan(planType);
    setIsLoading(true);
    setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      let userId = localStorage.getItem("talentos_user_id");
      if (!userId) {
        userId = `guest_${Date.now()}`;
        localStorage.setItem("talentos_user_id", userId);
      }

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: planType, user_id: userId }),
      });
      if (!orderResponse.ok) throw new Error("Failed to create order");

      const orderData = (await orderResponse.json()) as {
        key_id: string;
        amount: number;
        currency: string;
        order_id: string;
        description: string;
        prefill: { name: string; email: string; contact: string };
      };

      const options: Record<string, unknown> = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "TalentOS",
        description: orderData.description,
        image: "https://via.placeholder.com/150/06b6d4/ffffff?text=T",
        prefill: orderData.prefill,
        theme: { color: "#06b6d4", backdrop_color: "rgba(0, 0, 0, 0.8)" },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          setIsLoading(false);
          setSelectedPlan(null);
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: userId,
              }),
            });
            if (verifyResponse.ok) {
              setUserStatus({ is_pro: true });
              window.alert("Payment successful! Welcome to TalentOS Pro!");
              router.push("/workspace");
            } else {
              throw new Error("verify failed");
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setSelectedPlan(null);
          },
        },
      };

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) throw new Error("Razorpay unavailable");
      const rz = new RazorpayCtor(options);
      rz.open();
      setIsLoading(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    { type: "free", name: "Free", description: "Get started with basic features", amount: 0 },
    {
      type: "pro_monthly",
      name: "Pro Monthly",
      description: "Full access to all features",
      amount: pricing?.pro_monthly?.amount ?? 99900,
    },
    {
      type: "pro_yearly",
      name: "Pro Yearly",
      description: "Best value - 2 months free!",
      amount: pricing?.pro_yearly?.amount ?? 799900,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[length:4rem_4rem] pointer-events-none" />

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-space)]">TalentOS</span>
              <span className="text-xs text-zinc-500 block">Pricing</span>
            </div>
          </Link>
          {userStatus?.is_pro && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm">
              <Crown size={16} />
              Pro Member
            </div>
          )}
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-zinc-400 text-sm">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-space)] mb-4">
            Invest in Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"> Career</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Get unlimited access to AI-powered interview prep, resume optimization, and job discovery tools.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <PricingCard
              key={plan.type}
              plan={plan}
              isPopular={plan.type === "pro_monthly"}
              onSelect={handleSelectPlan}
              isLoading={isLoading && selectedPlan === plan.type}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Try Pro for just ₹1</h3>
          </div>
          <p className="text-zinc-400 text-sm mb-4">
            Not sure? Test all Pro features with our ₹1 trial before committing.
          </p>
          <button
            type="button"
            onClick={() => void handleSelectPlan("pro_trial")}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-all"
          >
            Start ₹1 Trial
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Everything You Need to Land Your Dream Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Gap Analysis", desc: "Identify skill gaps with resume-to-JD matching" },
              { icon: Mic, title: "Mock Interviews", desc: "Practice with AI interviewer, STAR scoring" },
              { icon: Target, title: "Resume Optimizer", desc: "Get specific improvements to stand out" },
              { icon: Briefcase, title: "Job Discovery", desc: "Find ad-tech roles via Adzuna API" },
              { icon: Shield, title: "Secure Payments", desc: "Razorpay secured, instant activation" },
              { icon: Clock, title: "24/7 Access", desc: "Practice anytime, anywhere" },
            ].map((feature, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/5">
                <feature.icon size={24} className="text-cyan-400 mb-3" />
                <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                <p className="text-zinc-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16 text-center">
          <p className="text-zinc-500 text-sm">
            Questions? Email us at{" "}
            <a href="mailto:support@adsgupta.com" className="text-cyan-400 hover:underline">
              support@adsgupta.com
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
