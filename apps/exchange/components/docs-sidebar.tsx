import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export function DocsSidebar() {
  const sections: NavSection[] = [
    {
      title: "Getting Started",
      items: [
        { label: "Overview", href: "/docs" },
        { label: "Publisher Quick Start", href: "/docs/publisher-quickstart" },
        { label: "Advertiser Quick Start", href: "/docs/advertiser-quickstart" }
      ]
    },
    {
      title: "Publisher Guide",
      items: [
        { label: "Registration", href: "/docs#publisher-registration" },
        { label: "Ad Units", href: "/docs#publisher-ad-units" },
        { label: "Tag Integration", href: "/docs#publisher-tag-integration" },
        { label: "ads.txt Setup", href: "/docs#publisher-ads-txt" },
        { label: "Analytics", href: "/docs#publisher-analytics" }
      ]
    },
    {
      title: "Advertiser Guide",
      items: [
        { label: "Creating Campaigns", href: "/docs#advertiser-creating-campaigns" },
        { label: "Uploading Creatives", href: "/docs#advertiser-uploading-creatives" },
        { label: "Targeting Options", href: "/docs#advertiser-targeting-options" },
        { label: "Campaign Dashboard", href: "/docs#advertiser-dashboard" }
      ]
    },
    {
      title: "Technical Reference",
      items: [
        { label: "mde.js Reference", href: "/docs/mde-js-reference" },
        { label: "OpenRTB Endpoint", href: "/docs/openrtb-endpoint" },
        { label: "Tracking Pixels", href: "/docs/openrtb-endpoint#tracking-pixels" },
        { label: "sellers.json", href: "/docs/openrtb-endpoint#sellers-json" }
      ]
    },
    {
      title: "API Reference",
      items: [
        { label: "Authentication", href: "/docs/api-reference#authentication" },
        { label: "Publishers API", href: "/docs/api-reference#publishers-api" },
        { label: "Campaigns API", href: "/docs/api-reference#campaigns-api" },
        { label: "Creatives API", href: "/docs/api-reference#creatives-api" },
        { label: "Reports API", href: "/docs/api-reference#reports-api" }
      ]
    }
  ];

  return (
    <aside
      style={{
        position: "sticky",
        top: 12,
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: "var(--card)",
        height: "fit-content",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>Documentation</div>
      <div style={{ display: "grid", gap: 14 }}>
        {sections.map((s) => (
            <div key={s.title} style={{ display: "grid", gap: 8 }}>
            <div className="shell-nav-section" style={{ margin: "8px 0 4px" }}>
              {s.title}
            </div>
            <nav style={{ display: "grid", gap: 6 }}>
              {s.items.map((it) => (
                <Link key={it.href + it.label} href={it.href} className="shell-nav-item">
                  {it.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

