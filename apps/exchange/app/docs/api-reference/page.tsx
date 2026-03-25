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
  "https://github.com/ranjandsgpt/adsgupta-main/blob/main/apps/exchange/app/docs/api-reference/page.tsx";

function EndpointCard({
  title,
  auth,
  method,
  path,
  requestExample,
  responseExample
}: {
  title: string;
  auth: string;
  method: string;
  path: string;
  requestExample?: string;
  responseExample?: string;
}) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text-bright)" }}>{method}</strong> {path}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Auth required: <strong style={{ color: "var(--text-bright)" }}>{auth}</strong>
          </div>
        </div>
      </div>
      {requestExample ? <DocCodeBlock language="json" code={requestExample} /> : null}
      {responseExample ? <DocCodeBlock language="json" code={responseExample} /> : null}
    </div>
  );
}

export default function ApiReferencePage() {
  const authNote = `Authenticated requests use NextAuth sessions (role-based access: admin | publisher | demand). For
some endpoints, the exchange also supports a lightweight email lock via query/body where noted in code.`;

  const createPublisherReq = `{
  "name": "Example Publisher",
  "domain": "publisher.example",
  "contact_email": "publisher@example.com",
  "sizes": ["300x250"],
  "ad_type": "display",
  "environment": "web",
  "floor_price": 0.5
}`;

  const createPublisherRes = `{
  "id": "UUID",
  "status": "pending",
  "name": "Example Publisher",
  "domain": "publisher.example"
}`;

  const patchPublisherReq = `{
  "status": "active"
}`;

  const postCampaignReq = `{
  "advertiser_name": "Example Advertiser",
  "advertiser_email": "buyer@example.com",
  "campaign_name": "Spring Promo",
  "bid_price": 5.0,
  "daily_budget": 50,
  "target_sizes": ["300x250"],
  "target_environments": ["web"],
  "target_devices": ["desktop"],
  "target_geos": ["all"]
}`;

  const postCampaignRes = `{
  "id": "UUID",
  "status": "pending",
  "campaign_name": "Spring Promo"
}`;

  const postCreativeReq = `{
  "campaign_id": "UUID",
  "advertiser_email": "buyer@example.com",
  "name": "Creative name",
  "type": "banner",
  "size": "300x250",
  "click_url": "https://landing.example",
  "file": "<multipart form upload>"
}`;

  const postCreativeRes = `{
  "id": "UUID",
  "campaign_id": "UUID",
  "size": "300x250",
  "status": "active"
}`;

  const impressionPixelRes = `(Returns a 1x1 transparent GIF)`;

  return (
    <article style={{ padding: 6 }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/docs" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Back to docs
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px", fontSize: 28, color: "var(--text-bright)" }}>API Reference</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
        A practical reference for the exchange’s HTTP endpoints. For exact payloads, see the server route handlers.
      </p>

      <EditThisPage href={editUrl} />

      <section id="authentication" style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Authentication</h2>
        <DocCodeBlock language="text" code={authNote} />
      </section>

      <section id="publishers-api" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 12 }}>Publishers API</h2>
        <div style={{ display: "grid", gap: 14 }}>
          <EndpointCard
            title="Create publisher"
            auth="admin"
            method="POST"
            path="/api/publishers"
            requestExample={createPublisherReq}
            responseExample={createPublisherRes}
          />
          <EndpointCard title="Get publisher" auth="admin/publisher" method="GET" path="/api/publishers/:id" />
          <EndpointCard
            title="Update publisher status"
            auth="admin"
            method="PATCH"
            path="/api/publishers/:id"
            requestExample={patchPublisherReq}
            responseExample={`{ "id": "UUID", "status": "active" }`}
          />
          <EndpointCard title="Delete publisher" auth="admin" method="DELETE" path="/api/publishers/:id" />
        </div>
      </section>

      <section id="campaigns-api" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 12 }}>Campaigns API</h2>
        <div style={{ display: "grid", gap: 14 }}>
          <EndpointCard
            title="Create campaign"
            auth="demand (or admin)"
            method="POST"
            path="/api/campaigns"
            requestExample={postCampaignReq}
            responseExample={postCampaignRes}
          />
          <EndpointCard title="List campaigns by email" auth="public (email lock)" method="GET" path="/api/campaigns?email={email}" responseExample={`[{ "id": "UUID", "campaign_name": "Spring Promo" }]`} />
          <EndpointCard title="Update campaign" auth="admin/demand" method="PATCH" path="/api/campaigns/:id" />
          <EndpointCard title="Bulk import campaigns (CSV)" auth="public (email lock)" method="POST" path="/api/campaigns/bulk" />
          <EndpointCard title="Bulk status update" auth="demand/admin" method="PATCH" path="/api/campaigns/bulk-status" />
          <EndpointCard title="Export campaigns as CSV" auth="public (email lock)" method="GET" path="/api/campaigns/export?email={email}" />
          <EndpointCard title="Duplicate campaign" auth="demand/admin" method="POST" path="/api/campaigns/:id/duplicate" />
          <EndpointCard title="Auto-optimize bid" auth="demand/admin" method="POST" path="/api/campaigns/:id/auto-optimize" />
        </div>
      </section>

      <section id="creatives-api" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 12 }}>Creatives API</h2>
        <div style={{ display: "grid", gap: 14 }}>
          <EndpointCard
            title="Create creative"
            auth="public (email lock) / demand/admin"
            method="POST"
            path="/api/creatives"
            requestExample={postCreativeReq}
            responseExample={postCreativeRes}
          />
          <EndpointCard title="List creatives by campaign/email" auth="public (email lock)" method="GET" path="/api/creatives?campaign_id={id}&email={email}" />
          <EndpointCard title="Update creative" auth="admin/demand" method="PATCH" path="/api/creatives/:id" />
          <EndpointCard title="Delete creative" auth="admin/demand" method="DELETE" path="/api/creatives/:id" />
          <EndpointCard title="Scan creative (rescan)" auth="publisher/admin" method="POST" path="/api/creatives/:id/scan" />
        </div>
      </section>

      <section id="reports-api" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 12 }}>Reports API</h2>
        <div style={{ display: "grid", gap: 14 }}>
          <EndpointCard
            title="Admin dashboard reports"
            auth="admin"
            method="GET"
            path="/api/reports/dashboard"
            responseExample={`{ \"auctionsToday\": 123, \"activeCampaigns\": 12 }`}
          />
          <EndpointCard
            title="Demand performance"
            auth="admin"
            method="GET"
            path="/api/demand-performance"
            responseExample={`{ \"rows\": [ ... ] }`}
          />
          <EndpointCard title="Auction log query" auth="admin" method="GET" path="/api/auction-log?limit=10&preset=today" />
          <EndpointCard title="Impression pixel" auth="public (pixel)" method="GET" path="/api/track/impression?id={auction_log_uuid}" responseExample={impressionPixelRes} />
        </div>
      </section>
    </article>
  );
}

