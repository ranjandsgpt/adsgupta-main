"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Bot, Download, Loader2, ArrowUpDown } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
const Paywall = dynamic(() => import("@/components/Paywall").then((m) => m.Paywall), { ssr: false });

type PrepPayload = {
  companyIntel: {
    companyName: string;
    industry: string;
    culture: { values: string[]; workStyle: string; interviewStyle: string };
  };
  prepGuide: {
    cheatSheet: {
      elevatorPitch: string;
      topSellingPoints: string[];
      gapMitigation: string[];
      questionsToAskThem: string[];
    };
    studyTopics: Array<{ topic: string; why: string; resources: string; timeNeeded: string }>;
    behavioralBank: Array<{ theme: string; suggestedStory: string; keyMetric: string }>;
    dayOfChecklist: string[];
  };
  roleName: string;
  companyName: string;
  matchScore: number;
};

export default function PrepGuidePage() {
  const [analysisId, setAnalysisId] = useState("");
  const [data, setData] = useState<PrepPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
  const [sortAsc, setSortAsc] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAnalysisId(params.get("analysisId") ?? "");
  }, []);

  useEffect(() => {
    (async () => {
      if (!analysisId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/prep-guide/${analysisId}`);
        if (!res.ok) {
          if (res.status === 403) setPaywallOpen(true);
          throw new Error("Failed to fetch prep guide");
        }
        const json = (await res.json()) as { payload?: PrepPayload };
        setData(json.payload ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load prep guide");
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId]);

  const sortedTopics = useMemo(() => {
    const list = [...(data?.prepGuide.studyTopics ?? [])];
    const order = ["30min", "1hr", "2hr", "4hr"];
    list.sort((a, b) => {
      const diff = order.indexOf(a.timeNeeded) - order.indexOf(b.timeNeeded);
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [data, sortAsc]);

  async function downloadPdf() {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current, { scale: 2, backgroundColor: "#050505" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    pdf.save(`prep-guide-${analysisId || "talentos"}.pdf`);
  }

  async function upgradeToPro() {
    setCheckoutLoading(true);
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Unable to load Razorpay"));
          document.body.appendChild(s);
        });
      }
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", currency: "INR" }),
      });
      if (!orderRes.ok) throw new Error("Unable to start payment");
      const order = (await orderRes.json()) as {
        order_id: string;
        key_id: string;
        amount: number;
        currency: string;
        description: string;
      };
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) throw new Error("Razorpay unavailable");
      const rz = new RazorpayCtor({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "TalentOS",
        description: order.description,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          setPaywallOpen(false);
          window.location.reload();
        },
      });
      rz.open();
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>{error || "Prep guide unavailable."}</p>
        <Paywall
          open={paywallOpen}
          featureName="Prep Guide"
          loading={checkoutLoading}
          onUpgrade={() => {
            void upgradeToPro();
          }}
          onClose={() => setPaywallOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-8">
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        <div className="flex items-center justify-between mb-6">
          <Link href={`/analysis?id=${analysisId}`} className="text-cyan-400 hover:underline">
            Back to Analysis
          </Link>
          <button
            type="button"
            onClick={downloadPdf}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2"
          >
            <Download size={16} />
            Download as PDF
          </button>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Bot size={18} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{data.companyIntel.companyName}</h1>
              <p className="text-zinc-400">{data.companyIntel.industry}</p>
            </div>
          </div>
          <p className="text-zinc-300">{data.companyIntel.culture.workStyle}</p>
          <p className="text-zinc-400 text-sm mt-2">Interview style: {data.companyIntel.culture.interviewStyle}</p>
        </motion.section>

        <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Cheat Sheet</h2>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <p className="text-cyan-100">{data.prepGuide.cheatSheet.elevatorPitch}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {data.prepGuide.cheatSheet.topSellingPoints.map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5">{p}</div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="text-sm text-zinc-400 mb-2">Gap Mitigation</h3>
            <ul className="space-y-2 text-zinc-300">
              {data.prepGuide.cheatSheet.gapMitigation.map((g, i) => <li key={i}>- {g}</li>)}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Study Plan</h2>
            <button type="button" onClick={() => setSortAsc((s) => !s)} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
              <ArrowUpDown size={14} />
              Sort by time
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/10">
                  <th className="text-left py-2">Topic</th>
                  <th className="text-left py-2">Why</th>
                  <th className="text-left py-2">Resources</th>
                  <th className="text-left py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedTopics.map((t, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2">{t.topic}</td>
                    <td className="py-2 text-zinc-400">{t.why}</td>
                    <td className="py-2 text-zinc-400">{t.resources}</td>
                    <td className="py-2">{t.timeNeeded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your STAR Stories</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.prepGuide.behavioralBank.map((s, i) => (
              <div key={i} className="rounded-xl bg-white/5 p-4">
                <p className="text-cyan-400 text-sm mb-1">{s.theme}</p>
                <p className="text-zinc-200">{s.suggestedStory}</p>
                <p className="text-zinc-400 text-sm mt-2">Metric: {s.keyMetric}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Questions to Ask Them</h2>
          <ul className="space-y-2 text-zinc-200">
            {data.prepGuide.cheatSheet.questionsToAskThem.map((q, i) => <li key={i}>- {q}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
          <h2 className="text-xl font-semibold mb-4">Interview Day Checklist</h2>
          <div className="space-y-2">
            {data.prepGuide.dayOfChecklist.map((item, i) => (
              <label key={i} className="flex items-start gap-2 text-zinc-200">
                <input
                  type="checkbox"
                  checked={Boolean(checklistState[i])}
                  onChange={() => setChecklistState((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="mt-1"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
      <Paywall
        open={paywallOpen}
        featureName="Prep Guide"
        loading={checkoutLoading}
        onUpgrade={() => {
          void upgradeToPro();
        }}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );
}
