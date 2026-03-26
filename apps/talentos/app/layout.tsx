import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "TalentOS by AdsGupta",
  description: "AI-powered interview preparation for ad-tech professionals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const postgresConfigured = Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QQSMFY85HZ" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QQSMFY85HZ');
          `}
        </Script>
        {postgresConfigured ? (
          children
        ) : (
          <div className="min-h-screen bg-[#050505] text-white p-8 flex items-center justify-center">
            <div className="max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
              <h1 className="text-2xl font-bold mb-3">Database Setup Required</h1>
              <p className="text-zinc-300 mb-4">
                POSTGRES configuration is missing. Set <code>POSTGRES_URL</code> and <code>POSTGRES_PRISMA_URL</code>,
                then run <code>npm run db:push</code> in <code>apps/talentos</code>.
              </p>
              <p className="text-zinc-500 text-sm">After configuration, reload this page.</p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
