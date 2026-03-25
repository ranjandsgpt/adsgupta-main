import { Resend } from "resend";

import { sql } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getClient(): Resend | null {
  if (!resend) {
    console.log("Email skipped: RESEND_API_KEY not configured");
    return null;
  }
  return resend;
}

const FROM = "MDE Exchange <noreply@exchange.adsgupta.com>";
const dash = (id: string) => `https://exchange.adsgupta.com/publisher/dashboard?id=${encodeURIComponent(id)}`;

function buildFirstTagSnippet(
  publisherId: string,
  row: { id: string; name: string; sizes: string[]; floor_price: string }
) {
  const size = row.sizes[0] ?? "300x250";
  const [w, h] = size.split("x");
  const floor = Number(row.floor_price ?? 0.5);
  const unitId = row.id;
  return `<!-- MDE Publisher Tag | ${row.name} | exchange.adsgupta.com -->
<div id='mde-${unitId}' style='width:${w}px;height:${h}px;overflow:hidden;'></div>
<script>
  window.mde=window.mde||{cmd:[]};
  mde.cmd.push(function(){
    mde.init({networkCode:'${publisherId}'});
    mde.defineSlot({unitId:'${unitId}',div:'mde-${unitId}',sizes:['${size}'],floor:${floor}});
    mde.enableServices();
    mde.display('mde-${unitId}');
  });
</script>
<script async src='https://exchange.adsgupta.com/mde.js'></script>`;
}

async function loadFirstUnitTag(publisherId: string): Promise<string | undefined> {
  try {
    const r = await sql<{ id: string; name: string; sizes: string[]; floor_price: string }>`
      SELECT id, name, sizes, floor_price::text
      FROM ad_units
      WHERE publisher_id = ${publisherId} AND status = 'active'
      ORDER BY created_at ASC
      LIMIT 1
    `;
    const row = r.rows[0];
    if (!row) return undefined;
    return buildFirstTagSnippet(publisherId, row);
  } catch {
    return undefined;
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export async function sendPublisherWelcomeEmail(email: string, name: string, publisherId: string) {
  const client = getClient();
  if (!client || !email) return;
  try {
    await client.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to MDE Exchange — registration pending",
      text: `Hi ${name},

Your publisher registration is pending review.

Publisher ID: ${publisherId}

What happens next: the MDE exchange team will review and activate your account. You will receive ad tags once activated.

Dashboard: ${dash(publisherId)}

— MDE Exchange`,
      html: `<p>Hi ${esc(name)},</p>
<p><strong>Your publisher registration is pending review.</strong></p>
<p>Publisher ID: <code style="color:#0066cc">${esc(publisherId)}</code></p>
<p>What happens next: the MDE exchange team will review and activate your account. You will receive ad tags once activated.</p>
<p><a href="${dash(publisherId)}">View your dashboard</a></p>
<p>— MDE Exchange</p>`
    });
  } catch (e) {
    console.error("[email] sendPublisherWelcomeEmail", e);
  }
}

export async function sendPublisherActivationEmail(email: string, name: string, publisherId: string) {
  const client = getClient();
  if (!client || !email) return;
  const tag = await loadFirstUnitTag(publisherId);
  try {
    const tagHtml = tag
      ? `<pre style="background:#f8f9fa;padding:12px;overflow:auto;font-size:11px;border:1px solid #e2e8f0">${esc(tag)}</pre>`
      : "<p>Create ad units in your dashboard to generate tags.</p>";
    await client.emails.send({
      from: FROM,
      to: email,
      subject: "Your MDE publisher account is now active",
      text: `Hi ${name},

Your MDE publisher account is now active.

Publisher ID: ${publisherId}

${tag ? `Sample tag:\n${tag}\n` : ""}

Dashboard: ${dash(publisherId)}

— MDE Exchange`,
      html: `<p>Hi ${esc(name)},</p>
<p><strong>Your MDE publisher account is now active.</strong></p>
<p>Publisher ID: <code style="color:#0066cc">${esc(publisherId)}</code></p>
<p><a href="${dash(publisherId)}">Open your dashboard</a></p>
${tagHtml}
<p>— MDE Exchange</p>`
    });
  } catch (e) {
    console.error("[email] sendPublisherActivationEmail", e);
  }
}

const demandUrl = (id: string) => `https://exchange.adsgupta.com/demand/dashboard?campaign=${encodeURIComponent(id)}`;

export async function sendDemandActivationEmail(email: string, campaignName: string, campaignId: string) {
  const client = getClient();
  if (!client || !email) return;
  try {
    await client.emails.send({
      from: FROM,
      to: email,
      subject: "Your campaign is now live on MDE Exchange",
      text: `Your campaign "${campaignName}" is now live.

Campaign ID: ${campaignId}

Dashboard: ${demandUrl(campaignId)}

— MDE Exchange`,
      html: `<p>Your campaign <strong>${esc(campaignName)}</strong> is now live.</p>
<p>Campaign ID: <code>${esc(campaignId)}</code></p>
<p><a href="${demandUrl(campaignId)}">Demand dashboard</a></p>
<p>— MDE Exchange</p>`
    });
  } catch (e) {
    console.error("[email] sendDemandActivationEmail", e);
  }
}
