import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Prep Guide | TalentOS — Personalized Interview Preparation",
  description:
    "Get personalized prep guides with elevator pitch, STAR stories, study topics, and interview-day checklists.",
  keywords: "interview prep guide, STAR stories, study plan, interview checklist",
};

export default function PrepLayout({ children }: { children: ReactNode }) {
  return children;
}
