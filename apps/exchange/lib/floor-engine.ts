import { cacheClear, cacheGet, cacheSet } from "@/lib/cache";
import { sql } from "@/lib/db";

type RuleRow = {
  id: string;
  name: string;
  floor_cpm: string;
  applies_to_sizes: string[] | null;
  applies_to_env: string | null;
  applies_to_geos: string[] | null;
  priority: string | null;
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function hasSizeOverlap(ruleSizes: string[] | null | undefined, requestSizes: string[]): boolean {
  if (!ruleSizes || ruleSizes.length === 0) return true;
  const set = new Set(requestSizes.map(norm));
  return ruleSizes.some((x) => set.has(norm(String(x))));
}

function geoMatches(ruleGeos: string[] | null | undefined, country: string | undefined): boolean {
  if (!ruleGeos || ruleGeos.length === 0) return true;
  if (!country?.trim()) return false;
  const cc = country.trim().toUpperCase();
  return ruleGeos.some((g) => String(g).trim().toUpperCase() === cc);
}

/** Rule matches when gates pass (legacy + geo + hour hints when present). */
function ruleApplies(
  rule: RuleRow,
  sizes: string[],
  environment: string,
  ctx: {
    country?: string;
    deviceType?: number;
    iabCats?: string[];
    isAboveFold?: boolean;
    hour?: number;
    dayOfWeek?: number;
  }
): boolean {
  const env = (rule.applies_to_env ?? "").trim().toLowerCase();
  if (env && env !== "all" && env !== environment.toLowerCase()) return false;
  if (!hasSizeOverlap(rule.applies_to_sizes, sizes)) return false;
  if (!geoMatches(rule.applies_to_geos, ctx.country)) return false;
  return true;
}

export type FloorExplanation = {
  unitFloor: number;
  ruleFloors: Array<{ name: string; floor: number }>;
  effective: number;
};

export async function getEffectiveFloor(params: {
  adUnitId: string;
  publisherId: string;
  sizes: string[];
  adType: string;
  environment: string;
  pageUrl: string;
  country?: string;
  deviceType?: number;
  iabCats?: string[];
  isAboveFold?: boolean;
  hour?: number;
  dayOfWeek?: number;
}): Promise<number> {
  const ex = await explainEffectiveFloor(params);
  return ex.effective;
}

export async function explainEffectiveFloor(params: {
  adUnitId: string;
  publisherId: string;
  sizes: string[];
  adType: string;
  environment: string;
  pageUrl: string;
  country?: string;
  deviceType?: number;
  iabCats?: string[];
  isAboveFold?: boolean;
  hour?: number;
  dayOfWeek?: number;
}): Promise<FloorExplanation> {
  const sizes = params.sizes.length ? params.sizes : ["300x250"];
  let unitFloor = 0;
  const unitKey = `unit:${params.publisherId}:${params.adUnitId}`;
  try {
    const cachedUnit = cacheGet<string>(unitKey);
    if (cachedUnit != null) {
      console.log("[cache]", unitKey, "HIT");
      unitFloor = Number(cachedUnit);
    } else {
      console.log("[cache]", unitKey, "MISS");
      const u = await sql<{ floor_price: string }>`
        SELECT floor_price::text FROM ad_units
        WHERE id = ${params.adUnitId} AND publisher_id = ${params.publisherId}
        LIMIT 1
      `;
      const fp = u.rows[0] ? u.rows[0].floor_price : "0";
      unitFloor = u.rows[0] ? Number(fp) : 0;
      cacheSet(unitKey, fp, 60_000);
    }
  } catch {
    unitFloor = 0;
  }

  const ruleFloors: Array<{ name: string; floor: number }> = [];
  let ruleMax = 0;
  let matchedName: string | null = null;
  const ctx = {
    country: params.country,
    deviceType: params.deviceType,
    iabCats: params.iabCats,
    isAboveFold: params.isAboveFold,
    hour: params.hour,
    dayOfWeek: params.dayOfWeek
  };

  try {
    const rulesKey = "pricing:rules:active";
    let rows: RuleRow[] | null = cacheGet<RuleRow[]>(rulesKey);
    if (rows) {
      console.log("[cache]", rulesKey, "HIT");
    } else {
      console.log("[cache]", rulesKey, "MISS");
      const result = await sql<RuleRow>`
        SELECT id, name, floor_cpm::text, applies_to_sizes, applies_to_env,
          applies_to_geos, priority::text
        FROM pricing_rules
        WHERE active = true
        ORDER BY priority DESC NULLS LAST, created_at DESC
      `;
      rows = result.rows;
      cacheSet(rulesKey, rows, 60_000);
    }
    const result = { rows: rows ?? [] };
    const sorted = [...result.rows].sort(
      (a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0)
    );
    for (const r of sorted) {
      if (!ruleApplies(r, sizes, params.environment, ctx)) continue;
      const v = Number(r.floor_cpm);
      if (!Number.isFinite(v)) continue;
      ruleFloors.push({ name: r.name, floor: v });
      if (v > ruleMax) {
        ruleMax = v;
        matchedName = r.name;
      }
    }
  } catch (e) {
    console.error("[floor-engine] rules load failed:", e);
  }

  const effective = Math.max(unitFloor, ruleMax);
  console.log(
    "[floor]",
    params.adUnitId,
    "effective floor:",
    effective,
    "rule:",
    matchedName ?? "base"
  );
  return { unitFloor, ruleFloors, effective };
}

/** Invalidate cached pricing rules (e.g. after admin edit). */
export function clearPricingRulesCache(): void {
  cacheClear("pricing:");
}
