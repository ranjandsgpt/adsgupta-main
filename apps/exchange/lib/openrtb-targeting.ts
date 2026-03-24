/** Map OpenRTB device.devicetype (IAB) to our campaign device labels. */
export function openRtbDeviceToLabels(devicetype: number | undefined | null): string[] {
  if (devicetype == null || Number.isNaN(Number(devicetype))) return [];
  const dt = Number(devicetype);
  const labels: string[] = [];
  // 1=mobile, 2=pc, 3=connected tv, 4=phone, 5=tablet, 6=wearable, 7=set top box
  if (dt === 2) labels.push("desktop");
  if (dt === 4 || dt === 1) labels.push("mobile");
  if (dt === 5) labels.push("tablet");
  if (dt === 3 || dt === 7) labels.push("ctv");
  return labels.length ? labels : [];
}

export type AuctionTargetingContext = {
  /** Normalized banner/imp sizes e.g. 300x250 */
  formatSizes: string[];
  /** Publisher site domain from publishers.domain */
  publisherDomain: string | null;
  /** Ad unit environment: web | app | ctv */
  adUnitEnvironment: string | null;
  /** ISO 3166-1 alpha-2 from device.geo.country */
  deviceCountry: string | null;
  /** Labels from device type: desktop, mobile, tablet, ctv */
  deviceLabels: string[];
};

export type CampaignTargetingRow = {
  target_sizes: string[] | null;
  target_environments: string[] | null;
  target_domains: string[] | null;
  target_geos: string[] | null;
  target_devices: string[] | null;
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function hasOverlap(a: string[] | null | undefined, b: string[]): boolean {
  if (!a || a.length === 0) return true;
  const set = new Set(b.map(norm));
  return a.some((x) => set.has(norm(String(x))));
}

/** Returns true if campaign passes all configured targeting gates. */
export function campaignMatchesTargeting(
  campaign: CampaignTargetingRow,
  ctx: AuctionTargetingContext
): boolean {
  const { formatSizes, publisherDomain, adUnitEnvironment, deviceCountry, deviceLabels } = ctx;

  if (campaign.target_sizes && campaign.target_sizes.length > 0) {
    if (!hasOverlap(campaign.target_sizes, formatSizes)) return false;
  }

  if (campaign.target_environments && campaign.target_environments.length > 0) {
    if (!adUnitEnvironment) return false;
    const envOk = campaign.target_environments.some((e) => norm(String(e)) === norm(adUnitEnvironment));
    if (!envOk) return false;
  }

  if (campaign.target_domains && campaign.target_domains.length > 0) {
    if (!publisherDomain) return false;
    const pd = norm(publisherDomain);
    const ok = campaign.target_domains.some((d) => norm(String(d)) === pd);
    if (!ok) return false;
  }

  if (campaign.target_geos && campaign.target_geos.length > 0) {
    if (!deviceCountry) return false;
    const cc = deviceCountry.toUpperCase();
    const geoOk = campaign.target_geos.some((g) => String(g).toUpperCase() === cc);
    if (!geoOk) return false;
  }

  if (campaign.target_devices && campaign.target_devices.length > 0) {
    if (!deviceLabels.length) return false;
    const wanted = new Set(campaign.target_devices.map((d) => norm(String(d))));
    const any = deviceLabels.some((l) => wanted.has(norm(l)));
    if (!any) return false;
  }

  return true;
}
