import "./globals.css";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://exchange.adsgupta.com"),
  title: { default: "MDE Exchange — Real-Time Ad Exchange", template: "%s | MDE Exchange" },
  description:
    "Real OpenRTB 2.6 ad exchange. Publisher monetization and advertiser self-serve. Sub-100ms auction clearing. Built by the InMobi programmatic team.",
  keywords: ["ad exchange", "OpenRTB", "programmatic advertising", "publisher monetization", "demand side platform", "SSP"],
  authors: [{ name: "Ranjan Dasgupta", url: "https://ranjan.adsgupta.com" }],
  openGraph: {
    type: "website",
    siteName: "MDE Exchange",
    locale: "en_US"
  },
  twitter: { card: "summary_large_image", creator: "@ranjandsgpt" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-H7ET1S7D2M" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H7ET1S7D2M');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
