import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { DocsSidebar } from "@/components/docs-sidebar";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      <CookieConsentBanner />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) 1fr", gap: 24, alignItems: "start" }}>
        <DocsSidebar />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}
