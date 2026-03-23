import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard | TalentOS — Progress and Readiness Tracking",
  description:
    "Track your interview readiness, match scores, activity timeline, resumes, saved jobs, and next prep topics in one dashboard.",
  keywords: "career dashboard, readiness score, interview progress, match score tracking",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
