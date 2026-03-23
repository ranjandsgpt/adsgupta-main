import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login | TalentOS — Sign In or Create Account",
  description:
    "Sign in or create your TalentOS account to start resume analysis, mock interviews, prep guides, and smart job matching.",
  keywords: "TalentOS login, sign in, create account, interview prep platform",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
