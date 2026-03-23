import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analysis | TalentOS — Resume-to-Role Fit Report",
  description:
    "View your match score, role alignment, strengths, skill gaps, and tailored interview questions generated from your resume and target role.",
  keywords: "match score, resume analysis report, skill gaps, interview questions",
};

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return children;
}
