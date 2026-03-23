"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-14 h-14 mx-auto rounded-xl bg-cyan-500/20 flex items-center justify-center"
        >
          <Bot size={24} className="text-cyan-300" />
        </motion.div>
        <p className="mt-3 text-zinc-300">{label}</p>
      </div>
    </div>
  );
}
