"use client";

import { motion } from "framer-motion";
import { Crown, X } from "lucide-react";
import { PLANS } from "@/lib/plans";

type Props = {
  open: boolean;
  featureName: string;
  loading?: boolean;
  onUpgrade: () => void;
  onClose: () => void;
};

export function Paywall({ open, featureName, loading = false, onUpgrade, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0A0A0A] p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown size={18} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Unlock {featureName} with TalentOS Pro</h3>
              <p className="text-zinc-400 text-sm">Upgrade to access all premium capabilities</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <ul className="space-y-2 mb-6 text-zinc-300 text-sm">
          {PLANS.pro.features.slice(0, 6).map((f) => (
            <li key={f}>- {f}</li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onUpgrade}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Upgrade Now - ₹499/month"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/10 text-zinc-200 hover:bg-white/20"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
