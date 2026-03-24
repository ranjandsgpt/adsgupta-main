import { PortalShell } from "@/components/portal-shell";

const DEMAND_NAV = [
  ["/demand", "Dashboard"],
  ["/demand/campaigns", "Campaigns"],
  ["/demand/creatives", "Creatives"],
  ["/demand/reporting", "Reporting"]
] as const;

export default function DemandLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      portalLabel="Demand"
      subtitle="Buy-side / DSP seat"
      nav={DEMAND_NAV.map(([href, label]) => ({ href, label }))}
    >
      {children}
    </PortalShell>
  );
}
