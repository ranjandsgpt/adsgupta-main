import "./globals.css";
import { Providers } from "@/components/providers";
import { JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyExchange",
  description: "exchange.adsgupta.com"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={mono.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
