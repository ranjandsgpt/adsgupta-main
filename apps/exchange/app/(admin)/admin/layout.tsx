import { PortalShell } from "@/components/portal-shell";

const ADMIN_NAV = [
  ["/admin", "Dashboard"],
  ["/admin/inventory", "Inventory"],
  ["/admin/delivery", "Delivery"],
  ["/admin/demand", "Demand Partners"],
  ["/admin/yield", "Yield & Pricing"],
  ["/admin/reporting", "Reporting"],
  ["/admin/ai", "AI Studio"],
  ["/admin/protections", "Protections"],
  ["/admin/tags", "Tag Generator"],
  ["/admin/settings", "Settings"]
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      portalLabel="Exchange admin"
      subtitle="Operations · full stack"
      nav={ADMIN_NAV.map(([href, label]) => ({ href, label }))}
    >
      {children}
    </PortalShell>
  );
}
