import Link from "next/link";
import { DocCodeBlock } from "@/components/doc-code-block";

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
  "https://github.com/ranjandsgpt/adsgupta-main/blob/main/apps/exchange/app/docs/advertiser-quickstart/page.tsx";

export default function AdvertiserQuickStartPage() {
  const creativeSpec = `Creative specs:
• File types: JPG / PNG / WebP
• Max file size: 2MB
• Sizes: IAB standard display sizes (e.g. 300x250, 728x90, 160x600, 320x50, 300x600, 970x250)
• Each creative includes a click-through URL.`;

  return (
    <article style={{ padding: 6 }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/docs" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Back to docs
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px", fontSize: 28, color: "var(--text-bright)" }}>Advertiser Quick Start</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
        Create a campaign, upload creatives, and go live after exchange activation.
      </p>

      <EditThisPage href={editUrl} />

      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>1) Create campaign</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
            Set bid CPM, daily budget, target sizes, environments, devices, and geo rules.
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>2) Upload creative</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
            Use supported formats and sizes. The exchange scanner validates the creative before launch.
          </div>
          <DocCodeBlock language="text" code={creativeSpec} />
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>3) Set bid and budget</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
            Your bid and budget govern eligibility in auctions. Once active, your ads compete in second-price auctions.
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>4) Wait for activation</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
            After the exchange reviews your campaign, it becomes eligible for real traffic. Use the demand dashboard to track
            wins, impressions, and spend by email.
          </div>
        </div>
      </div>
    </article>
  );
}

