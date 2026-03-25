import { sql } from "@/lib/db";
import type { OpenRTB26BidRequest, OpenRTB26BidResponse } from "@/lib/openrtb-types";

export type DSP = {
  id: string;
  name: string;
  endpoint_url: string;
  auth_token: string | null;
  bid_timeout_ms: number;
  active: boolean;
};

export type DspBid = {
  dsp: DSP;
  price: number;
  adm: string;
  w: number;
  h: number;
  crid?: string;
  adomain?: string[];
  /** Raw OpenRTB bid for extra fields */
  raw?: Record<string, unknown>;
};

function parseBidResponse(raw: unknown): OpenRTB26BidResponse | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as OpenRTB26BidResponse;
    } catch {
      return null;
    }
  }
  return raw as OpenRTB26BidResponse;
}

export async function requestDspBid(dsp: DSP, bidRequest: OpenRTB26BidRequest): Promise<DspBid | null> {
  let outbound: OpenRTB26BidRequest;
  try {
    outbound = JSON.parse(JSON.stringify(bidRequest)) as OpenRTB26BidRequest;
  } catch {
    outbound = bidRequest;
  }

  try {
    const body = JSON.stringify(outbound);
    const timeout = Math.max(50, Math.min(dsp.bid_timeout_ms || 150, 2000));
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (dsp.auth_token) headers.Authorization = `Bearer ${dsp.auth_token}`;

    const res = await fetch(dsp.endpoint_url, {
      method: "POST",
      headers,
      body,
      signal: ctrl.signal
    }).finally(() => clearTimeout(t));

    if (!res.ok) {
      console.log("[dsp]", dsp.name, "bid:", "no fill", `(HTTP ${res.status})`);
      return null;
    }

    const json = parseBidResponse(await res.json());
    const seat = json?.seatbid?.[0];
    const first = seat?.bid?.[0];
    if (!first || first.price == null || !first.adm) {
      console.log("[dsp]", dsp.name, "bid:", "no fill");
      return null;
    }

    console.log("[dsp]", dsp.name, "bid:", first.price);

    const w = first.w ?? 300;
    const h = first.h ?? 250;
    return {
      dsp,
      price: Number(first.price),
      adm: String(first.adm),
      w,
      h,
      crid: first.crid,
      adomain: first.adomain,
      raw: first as unknown as Record<string, unknown>
    };
  } catch (e) {
    console.log("[dsp]", dsp.name, "bid:", "no fill", String(e));
    return null;
  }
}

export async function requestAllDspBids(
  bidRequest: OpenRTB26BidRequest,
  opts?: { stripUserIdentity?: boolean }
): Promise<DspBid[]> {
  let outbound: OpenRTB26BidRequest = bidRequest;
  if (opts?.stripUserIdentity) {
    outbound = JSON.parse(JSON.stringify(bidRequest)) as OpenRTB26BidRequest;
    if (outbound.user) {
      delete outbound.user.buyeruid;
      delete (outbound.user as { id?: string }).id;
    }
  }

  const dsps: DSP[] = [];
  try {
    const partners = await sql<{
      id: string;
      name: string;
      endpoint_url: string;
      timeout_ms: string;
      auth_credentials: Record<string, unknown> | null;
    }>`
      SELECT id, name, endpoint_url, timeout_ms::text, auth_credentials
      FROM dsp_partners
      WHERE status = 'active'
    `;
    for (const row of partners.rows) {
      const cred = row.auth_credentials ?? {};
      const token =
        (typeof cred.bearer === "string" && cred.bearer) ||
        (typeof cred.token === "string" && cred.token) ||
        (typeof cred.authorization === "string" && cred.authorization) ||
        null;
      dsps.push({
        id: row.id,
        name: row.name,
        endpoint_url: row.endpoint_url,
        auth_token: token,
        bid_timeout_ms: Number(row.timeout_ms) || 150,
        active: true
      });
    }
  } catch (e) {
    console.error("[dsp] dsp_partners:", e);
  }
  try {
    const legacy = await sql<DSP>`
      SELECT id, name, endpoint_url, auth_token, bid_timeout_ms, active
      FROM dsps WHERE active = true
    `;
    for (const row of legacy.rows) {
      dsps.push({
        ...row,
        bid_timeout_ms: Number(row.bid_timeout_ms)
      });
    }
  } catch (e) {
    console.error("[dsp] dsps:", e);
  }
  if (dsps.length === 0) return [];

  const settled = await Promise.allSettled(dsps.map((d) => requestDspBid(d, outbound)));
  const out: DspBid[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value) out.push(s.value);
  }
  return out;
}
