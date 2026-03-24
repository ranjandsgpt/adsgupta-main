"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Bot, Check, Crown, Loader2, Sparkles } from "@/components/icons";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD" | "JPY">("INR");
  const [priceLabel, setPriceLabel] = useState("₹499/month");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const config = await fetch("/api/payments/config");
      const cfg = (await config.json()) as { enabled?: boolean };
      setPaymentsEnabled(Boolean(cfg.enabled));
      const geo = await fetch("/api/geo");
      const g = (await geo.json()) as { currency?: "INR" | "USD" | "JPY"; priceLabel?: string };
      setCurrency(g.currency || "INR");
      setPriceLabel(g.priceLabel || "₹499/month");
      const status = await fetch("/api/payments/status");
      if (status.ok) {
        const s = (await status.json()) as { isSubscribed?: boolean };
        setIsSubscribed(Boolean(s.isSubscribed));
      }
    })().catch(() => undefined);
  }, []);

  async function handleUpgrade(plan: "pro" | "weekly" = "pro") {
    setIsLoading(true);
    setError("");
    try {
      if (!paymentsEnabled) {
        setError("Payments coming soon");
        return;
      }
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Unable to load Razorpay"));
          document.body.appendChild(s);
        });
      }
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          currency: plan === "weekly" ? "USD" : currency,
        }),
      });
      if (!orderResponse.ok) throw new Error("Failed to create order");
      const orderData = (await orderResponse.json()) as {
        order_id: string;
        key_id: string;
        amount: number;
        currency: string;
        description: string;
      };
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) throw new Error("Razorpay unavailable");
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "TalentOS",
        description: orderData.description,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (!verifyResponse.ok) {
            setError("Payment verification failed. Please contact support.");
            return;
          }
          setSuccess(true);
          setTimeout(() => router.push("/dashboard"), 1200);
        }
      };
      const rz = new RazorpayCtor(options);
      rz.open();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
  }

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
          {isSubscribed && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm">
              <Crown size={16} />
              Pro Member
            </div>
          )}
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-zinc-400 text-sm">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-space)] mb-4">
            Plans That Grow With You
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Explorer, Professional, and Enterprise options for every stage.</p>
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
        {success ? (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center">
            Subscription activated! Redirecting to dashboard...
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl border bg-[#0A0A0A] border-white/10">
            <h3 className="text-xl font-bold mb-2">{PLANS.free.name}</h3>
            <p className="text-4xl font-bold mb-4">$0</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {PLANS.free.features.map((f) => <li key={f}>- {f}</li>)}
            </ul>
            <div className="mt-5 px-3 py-2 rounded-lg bg-white/10 text-zinc-300 text-center">
              {!isSubscribed ? "Current Plan" : "Downgrade"}
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-[#0A0A0A] border-white/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-white text-black font-semibold">New</div>
            <h3 className="text-xl font-bold mb-2">Starter Weekly</h3>
            <p className="text-4xl font-bold mb-4">$1/week</p>
            <ul className="space-y-2 text-sm text-zinc-200">
              <li>- Unlimited resume analyses</li>
              <li>- Unlimited mock interviews</li>
              <li>- AI recommendations</li>
              <li>- Prep guides and exports</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                void handleUpgrade("weekly");
              }}
              disabled={isLoading || isSubscribed || !paymentsEnabled}
              className="mt-5 w-full px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
            >
              {isSubscribed ? "Current Plan" : "Upgrade to $1/week"}
            </button>
          </div>

          <div className="p-6 rounded-2xl border bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/40 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-cyan-500 text-black font-semibold">Most Popular</div>
            <h3 className="text-xl font-bold mb-2">{PLANS.pro.name}</h3>
            <p className="text-4xl font-bold mb-4">{priceLabel}</p>
            <ul className="space-y-2 text-sm text-zinc-200">
              {PLANS.pro.features.map((f) => <li key={f}>- {f}</li>)}
            </ul>
            <button
              type="button"
              onClick={() => {
                void handleUpgrade("pro");
              }}
              disabled={isLoading || isSubscribed || !paymentsEnabled}
              className="mt-5 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Processing</> : isSubscribed ? "Current Plan" : "Upgrade to Pro"}
            </button>
            {!paymentsEnabled ? <p className="text-zinc-500 text-xs mt-2 text-center">Payments coming soon</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-zinc-400 border-b border-white/10">
                <th className="text-left py-2">Feature</th>
                <th className="text-left py-2">Explorer</th>
                <th className="text-left py-2">Professional</th>
                <th className="text-left py-2">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Resume Analyses", "3", "Unlimited", "Unlimited"],
                ["Mock Interviews", "1", "Unlimited", "Unlimited"],
                ["Company Intelligence", "-", "Yes", "Yes"],
                ["Prep Guides", "-", "Yes", "Yes"],
                ["Plan Type", "Free", "$1/week", "Monthly"],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-white/5">
                  <td className="py-2">{row[0]}</td>
                  <td className="py-2 text-zinc-300">{row[1]}</td>
                  <td className="py-2 text-zinc-300">{row[2]}</td>
                  <td className="py-2 text-zinc-300">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
