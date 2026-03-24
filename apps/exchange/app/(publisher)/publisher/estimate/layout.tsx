import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Revenue Estimator — How Much Can Your Website Earn? | MDE Exchange",
  description:
    "Calculate your website's ad revenue potential. Free tool by MDE Exchange using real OpenRTB auction data.",
  openGraph: {
    title: "Ad Revenue Estimator | MDE Exchange",
    description: "Calculate your website's ad revenue potential with MDE Exchange."
  }
};

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
