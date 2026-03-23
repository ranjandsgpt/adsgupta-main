"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { label: "Upload Resume", href: "/workspace" },
  { label: "Analyze Match", href: "/analysis" },
  { label: "Prep Guide", href: "/prep" },
  { label: "Mock Interview", href: "/interview" },
  { label: "Find Jobs", href: "/jobs" },
];

function getCurrentStep(pathname: string): number {
  if (pathname.startsWith("/workspace")) return 0;
  if (pathname.startsWith("/analysis")) return 1;
  if (pathname.startsWith("/prep")) return 2;
  if (pathname.startsWith("/interview")) return 3;
  if (pathname.startsWith("/jobs")) return 4;
  return -1;
}

export function WorkflowProgress() {
  const pathname = usePathname();
  const current = getCurrentStep(pathname);

  if (!pathname || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
        {STEPS.map((step, index) => {
          const isCurrent = current === index;
          const isCompleted = current > index;
          return (
            <Link
              key={step.href}
              href={step.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs border transition-all ${
                isCurrent
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : isCompleted
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-white/5 text-zinc-400 border-white/10"
              }`}
            >
              {step.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
