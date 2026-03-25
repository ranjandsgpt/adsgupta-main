import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange statistics — active demand & publishers | MDE Exchange",
  description:
    "Public snapshot of publisher count, recent impression volume, and blended pricing on MDE Exchange."
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
