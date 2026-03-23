import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mock Interview | TalentOS — Practice with AI Personas",
  description:
    "Practice interviews with recruiter, hiring manager, technical peer, and bar raiser personas with STAR scoring and adaptive difficulty.",
  keywords: "AI mock interview, STAR scoring, interviewer personas, interview practice",
};

export default function InterviewLayout({ children }: { children: ReactNode }) {
  return children;
}
