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
  "https://github.com/ranjandsgpt/adsgupta-main/blob/main/apps/exchange/app/docs/publisher-quickstart/page.tsx";

export default function PublisherQuickStartPage() {
  const step4Tag = `<!-- Step 4 — Copy the tag (ad slot + mde.js embed) -->
<div id="mde-slot-1"></div>
<script type="module">
  import * as mde from 'https://exchange.adsgupta.com/mde.js';
  mde.init({ seat: 'mde', publisherId: 'YOUR_PUBLISHER_ID' });
  mde.defineSlot({
    adUnitId: 'YOUR_AD_UNIT_ID',
    divId: 'mde-slot-1',
    sizes: ['300x250']
  });
  mde.enableServices();
  mde.display('mde-slot-1');
</script>`;

  const step5Paste = `<!-- Step 5 — Paste into your HTML -->
<!-- Put this where you want the ad to render -->
<div class="product-sidebar">
  <h3>Sponsored</h3>
  <div id="mde-slot-1"></div>
</div>
<script type="module">
  import * as mde from 'https://exchange.adsgupta.com/mde.js';
  mde.init({ seat: 'mde', publisherId: 'YOUR_PUBLISHER_ID' });
  mde.defineSlot({ adUnitId: 'YOUR_AD_UNIT_ID', divId: 'mde-slot-1', sizes: ['300x250'] });
  mde.enableServices();
  mde.display('mde-slot-1');
</script>`;

  return (
    <article style={{ padding: 6 }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/docs" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Back to docs
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px", fontSize: 28, color: "var(--text-bright)" }}>Publisher Quick Start</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
        Get from signup to earning in five steps.
      </p>

      <EditThisPage href={editUrl} />

      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        {[
          { title: "1) Register", desc: "Create your publisher account and provide your domain + contact email." },
          { title: "2) Wait for activation", desc: "After validation, your account becomes active and inventory can enter auctions." },
          { title: "3) Create ad unit", desc: "In the publisher portal, define your ad unit (sizes, environment, floor price)." },
          { title: "4) Copy tag", desc: "Copy the mde.js embed for the ad unit you just created." },
          { title: "5) Paste into HTML", desc: "Paste the tag into your page where the ad should render." }
        ].map((s) => (
          <div key={s.title} className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 6 }}>{s.title}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
            {s.title.startsWith("4)") && (
              <DocCodeBlock language="html" code={step4Tag} />
            )}
            {s.title.startsWith("5)") && (
              <DocCodeBlock language="html" code={step5Paste} />
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

