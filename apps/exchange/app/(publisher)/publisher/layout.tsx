import { PortalShell } from "@/components/portal-shell";

const PUB_NAV = [
  ["/publisher", "Dashboard"],
  ["/publisher/inventory", "Ad units"],
  ["/publisher/tags", "Tags"],
  ["/publisher/reporting", "Reporting"]
] as const;

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      portalLabel="Publisher"
      subtitle="Self-serve supply"
      nav={PUB_NAV.map(([href, label]) => ({ href, label }))}
    >
      {children}
    </PortalShell>
  );
}
