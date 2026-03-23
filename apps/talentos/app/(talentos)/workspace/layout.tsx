import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Workspace | TalentOS — Upload Resume and Analyze Match",
  description:
    "Upload your resume and job description to get AI-powered match analysis, strengths, gaps, and interview prep direction.",
  keywords: "resume upload, job description analysis, AI fit score, career workspace",
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return children;
}
