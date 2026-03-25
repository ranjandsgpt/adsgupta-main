import { DocsSidebar } from "@/components/docs-sidebar";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "calc(100vh - 80px)", maxWidth: 1200, margin: "0 auto", padding: "18px 16px 64px" }}>
      <CookieConsentBanner />
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "start", marginTop: 10 }}>
        <div>
          <DocsSidebar />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

