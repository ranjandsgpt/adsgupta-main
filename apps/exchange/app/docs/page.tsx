import Link from "next/link";
import { DocCodeBlock } from "@/components/doc-code-block";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Getting started and technical reference for MDE Exchange (mde.js, OpenRTB, and public APIs)."
};

function EditThisPage({ href }: { href: string }) {
  return (
    <div style={{ marginTop: 18, marginBottom: 10 }}>
      <a href={href} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
        Edit this page →
      </a>
    </div>
  );
}

const editUrl =
  "https://github.com/ranjandsgpt/adsgupta-main/blob/main/apps/exchange/app/docs/page.tsx";

export default function DocsOverviewPage() {
  return (
    <article style={{ padding: 6, color: "var(--text)" }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Home
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px", fontSize: 28, color: "var(--text-bright)" }}>Overview</h1>

      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
        MDE Exchange is a real-time ad exchange running OpenRTB 2.6 auctions. Publishers embed{" "}
        <code style={{ color: "var(--accent)" }}>mde.js</code>, advertisers upload creatives and set bids. The
        exchange clears auctions in <strong>&lt;100ms</strong>.
      </p>

      <EditThisPage href={editUrl} />

      <section id="publisher-registration" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Publisher Registration</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Register as a publisher, wait for activation, then create ad units inside your publisher portal. Once active,
          your inventory participates in live OpenRTB auctions.
        </p>
      </section>

      <section id="publisher-ad-units" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Ad Units</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Each ad unit declares sizes, environment (web/app/ctv), and a floor price. The exchange uses this to evaluate
          bids and clear the auction.
        </p>
      </section>

      <section id="publisher-tag-integration" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Tag Integration</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Use the mde.js embed to define a slot, enable services, and display the div where ads should render.
          For full API details, see the{" "}
          <Link href="/docs/mde-js-reference" style={{ color: "var(--accent)" }}>
            mde.js Reference
          </Link>
          .
        </p>
        <DocCodeBlock
          language="html"
          code={`<!-- Example mde.js embed -->
<div id="ad-slot-1"></div>
<script type="module">
  import * as mde from 'https://exchange.adsgupta.com/mde.js';
  mde.init({ seat: 'mde', publisherId: 'YOUR_PUBLISHER_ID' });
  mde.defineSlot({ adUnitId: 'YOUR_AD_UNIT_ID', divId: 'ad-slot-1', sizes: ['300x250'] });
  mde.enableServices();
  mde.display('ad-slot-1');
</script>`}
        />
      </section>

      <section id="publisher-ads-txt" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>ads.txt Setup</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          No ads.txt is required to start monetizing. If you publish ads.txt, it can improve buyer trust and reduce
          friction for certain demand partners.
        </p>
      </section>

      <section id="publisher-analytics" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Analytics</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Your publisher analytics show impressions, win rate, and revenue breakdowns. For technical queries, the
          exchange also exposes reporting endpoints under the API reference.
        </p>
      </section>

      <section id="advertiser-creating-campaigns" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Creating Campaigns</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Campaigns define your advertiser seat, bid CPM, daily budget, targeting constraints, and eligible sizes.
          Once submitted and activated, your line participates in auctions across inventory.
        </p>
      </section>

      <section id="advertiser-uploading-creatives" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Uploading Creatives</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Upload creatives as JPG/PNG/WebP with a maximum size of 2MB. Each creative includes an image and a click
          destination URL that the exchange uses to generate the rendered ad markup.
        </p>
      </section>

      <section id="advertiser-targeting-options" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Targeting Options</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          Target environments, devices, countries (or “all”), and eligible sizes. The auction engine evaluates
          targeting and applies frequency caps for additional control.
        </p>
      </section>

      <section id="advertiser-dashboard" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", margin: "0 0 10px" }}>Campaign Dashboard</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
          After activation, your dashboard shows live auction performance, creatives performance, and optional campaign
          intelligence and A/B test results.
        </p>
      </section>
    </article>
  );
}

