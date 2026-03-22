import { Exo_2, Space_Grotesk } from "next/font/google";
import { Footer } from "@adsgupta/ui";
import type { ReactNode } from "react";

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
      <div className="grain-overlay" aria-hidden />
      {children}
      <Footer />
    </div>
  );
}
