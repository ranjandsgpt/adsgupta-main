import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Revenue Estimator",
  description: "Estimate your potential ad revenue using real OpenRTB auction signals and MDE Exchange analytics.",
  openGraph: {
    title: "Ad Revenue Estimator | MDE Exchange",
    description: "Estimate your potential ad revenue with MDE Exchange."
  }
};

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
