import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing | TalentOS — Free, Pro, and Enterprise Plans",
  description:
    "Compare Explorer, Professional, and Enterprise plans. Start free or upgrade for unlimited analyses, interviews, and prep guides.",
  keywords: "TalentOS pricing, interview prep subscription, pro plan, enterprise plan",
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
