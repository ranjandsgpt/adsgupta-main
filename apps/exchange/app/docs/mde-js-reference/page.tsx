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
  "https://github.com/ranjandsgpt/adsgupta-main/blob/main/apps/exchange/app/docs/mde-js-reference/page.tsx";

const exampleEmbed = `<div id="mde-slot"></div>
<script type="module">
  import * as mde from 'https://exchange.adsgupta.com/mde.js';

  mde.init({
    seat: 'mde',
    publisherId: 'YOUR_PUBLISHER_ID'
  });

  mde.defineSlot({
    adUnitId: 'YOUR_AD_UNIT_ID',
    divId: 'mde-slot',
    sizes: ['300x250']
  });

  mde.enableServices();
  mde.display('mde-slot');
</script>`;

export default function MdeJsReferencePage() {
  return (
    <article style={{ padding: 6 }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/docs" style={{ color: "var(--accent)", fontSize: 12 }}>
          ← Back to docs
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px", fontSize: 28, color: "var(--text-bright)" }}>mde.js Reference</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14 }}>
        mde.js is the browser client used by publishers to define slots and render winning creatives. You must call{" "}
        <code style={{ color: "var(--accent)" }}>mde.display(divId)</code> after you finish defining your slots.
      </p>

      <EditThisPage href={editUrl} />

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Public API</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            {
              fn: "mde.init(config)",
              desc: "Initialize the library. Call once on page load.",
              params: "config object params (seat, publisherId, etc.)"
            },
            {
              fn: "mde.defineSlot(slotConfig)",
              desc: "Declare one ad slot. Call before enableServices().",
              params: "slot config params (adUnitId, divId, sizes, targeting...)"
            },
            {
              fn: "mde.enableServices()",
              desc: "Enable auction + tracking services. Call after all slots are defined.",
              params: "No args."
            },
            {
              fn: "mde.display(divId)",
              desc: "Trigger the auction for a slot and render the result into the provided div.",
              params: "divId string."
            },
            {
              fn: "mde.getVersion()",
              desc: "Return the mde.js version string.",
              params: "No args."
            }
          ].map((x) => (
            <div key={x.fn} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, color: "var(--text-bright)", fontWeight: 900, marginBottom: 6 }}>{x.fn}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{x.desc}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ color: "var(--text-bright)", fontWeight: 800 }}>Params:</span> {x.params}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-bright)", marginBottom: 10 }}>Full example</h2>
        <DocCodeBlock language="html" code={exampleEmbed} />
      </section>
    </article>
  );
}

