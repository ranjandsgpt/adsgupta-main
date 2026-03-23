import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Jobs | TalentOS — Smart Job Search and Recommendations",
  description:
    "Discover roles across 10+ countries, save jobs, and get AI-ranked recommendations based on your resume analysis.",
  keywords: "job search, AI job recommendations, global jobs, saved jobs",
};

export default function JobsLayout({ children }: { children: ReactNode }) {
  return children;
}
