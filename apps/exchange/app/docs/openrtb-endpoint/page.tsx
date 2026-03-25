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
  "https://github.com/ranjandsgpt/adsgupta-main/blob/main/apps/exchange/app/docs/openrtb-endpoint/page.tsx";

const bidRequestExample = `{
  "id": "AUCTION_LOG_ID_OR_EXTERNAL_ID",
  "tmax": 500,
  "imp": [
    {
      "id": "1",
      "tagid": "AD_UNIT_ID",
      "banner": { "w": 300, "h": 250, "battr": [], "pos": 0 },
      "bidfloor": 0.5
    }
  ],
  "site": { "page": "https://publisher.example/product" },
  "device": { "ua": "Mozilla/5.0", "ip": "203.0.113.7" }
}`;

const bidResponseExample = `{
  "id": "AUCTION_LOG_ID_OR_EXTERNAL_ID",
  "cur": "USD",
  "seatbid": [
    {
      "bid": [
        {
          "id": "AUCTION_LOG_UUID",
          "impid": "1",
          "price": 2.34,
          "adid": "CREATIVE_ID",
          "cid": "CAMPAIGN_ID",
          "crid": "WINNING_CREATIVE_ID",
          "adomain": ["advertiser.example"],
          "adm": "<a ...><img ... /></a>",
          "nurl": "https://exchange.adsgupta.com/api/openrtb/win?auctionId=...&price=\${AUCTION_PRICE}",
          "w": 300,
          "h": 250
        }
      ]
    }
  ],
  "bidid": "AUCTION_LOG_UUID"
}`;

const noBidResponse = `{
  "id": "AUCTION_LOG_ID_OR_EXTERNAL_ID",
  "nbr": 2
}`;

const winNoticeExample = `GET https://exchange.adsgupta.com/api/openrtb/win?auctionId={auction_log_id}&price={clearing_price}`;

const corsExample = `Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-MDE-Version`;

const trackingPixels = `Impression pixel:
GET https://exchange.adsgupta.com/api/track/impression?id={auction_log_id}

Click pixel:
GET https://exchange.adsgupta.com/api/track/click?id={auction_log_id}`;

const sellersJsonExample = `GET https://exchange.adsgupta.com/sellers.json
// Exposes seller(s) metadata for programmatic compliance.`;

export default function OpenRtbEndpointPage() {
  return (
    <article style={{ padding: 6 }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/docs" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Back to docs
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px", fontSize: 28, color: "var(--text-bright)" }}>OpenRTB Endpoint</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
        How mde.js and other demand partners submit bids, receive bid responses, and report win/impression events.
      </p>

      <EditThisPage href={editUrl} />

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Endpoint URL</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
          POST{" "}
          <code style={{ color: "var(--accent)" }}>https://exchange.adsgupta.com/api/openrtb/auction</code>
        </p>
        <DocCodeBlock language="text" code={`POST https://exchange.adsgupta.com/api/openrtb/auction`} />
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Request format (BidRequest)</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
          The exchange expects an OpenRTB 2.6 bid request JSON. Each impression contains an ad unit identifier
          (tagid/id) and banner sizes.
        </p>
        <DocCodeBlock language="json" code={bidRequestExample} />
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Response format (BidResponse)</h2>
        <DocCodeBlock language="json" code={bidResponseExample} />
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>No-bid response</h2>
        <DocCodeBlock language="json" code={noBidResponse} />
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Win notice</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
          After a bid is selected, the exchange can mark the auction as cleared when it receives a win notice.
        </p>
        <DocCodeBlock language="text" code={winNoticeExample} />
      </section>

      <section id="tracking-pixels" style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Tracking pixels</h2>
        <DocCodeBlock language="text" code={trackingPixels} />
      </section>

      <section id="sellers-json" style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>sellers.json</h2>
        <DocCodeBlock language="text" code={sellersJsonExample} />
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>CORS headers</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
          The exchange supports CORS for auction POST requests.
        </p>
        <DocCodeBlock language="text" code={corsExample} />
      </section>
    </article>
  );
}

