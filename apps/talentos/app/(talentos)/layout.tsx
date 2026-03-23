import { Exo_2, Space_Grotesk } from "next/font/google";
import { Footer } from "@adsgupta/ui";
import type { ReactNode } from "react";
import { WorkflowProgress } from "@/components/WorkflowProgress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TalentOS — AI Career Intelligence Platform | Resume Analysis, Mock Interviews, Job Matching",
  description:
    "Upload your resume, get AI-powered analysis, practice with 4 AI interviewer personas, receive STAR-method scoring, personalized prep guides, and smart job recommendations across 10+ countries.",
  keywords:
    "AI interview prep, resume analysis, mock interview, STAR method, job matching, career intelligence",
  openGraph: {
    title: "TalentOS — AI Career Intelligence Platform",
    description:
      "The all-in-one AI platform for job seekers: resume analysis, mock interviews, prep guides, and job matching.",
    url: "https://talentos.adsgupta.com",
    siteName: "TalentOS by AdsGupta",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentOS — AI Career Intelligence Platform",
    description: "Resume analysis + AI mock interviews + smart job matching. Free to start.",
  },
};

const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export default function TalentosLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${exo.variable} ${space.variable} font-sans`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-cyan-500 focus:text-black focus:px-3 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <div className="grain-overlay" aria-hidden />
      <WorkflowProgress />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
