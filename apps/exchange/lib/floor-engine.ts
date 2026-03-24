import { sql } from "@/lib/db";

type RuleRow = {
  id: string;
  name: string;
  floor_cpm: string;
  applies_to_sizes: string[] | null;
  applies_to_env: string | null;
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function hasSizeOverlap(ruleSizes: string[] | null | undefined, requestSizes: string[]): boolean {
  if (!ruleSizes || ruleSizes.length === 0) return true;
  const set = new Set(requestSizes.map(norm));
  return ruleSizes.some((x) => set.has(norm(String(x))));
}

/** Rule matches when size gate passes and environment gate passes (same as legacy pricing-floor). */
function ruleApplies(rule: RuleRow, sizes: string[], environment: string): boolean {
  const env = (rule.applies_to_env ?? "").trim().toLowerCase();
  if (env && env !== "all" && env !== environment.toLowerCase()) return false;
  return hasSizeOverlap(rule.applies_to_sizes, sizes);
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
}): Promise<FloorExplanation> {
  const sizes = params.sizes.length ? params.sizes : ["300x250"];
  let unitFloor = 0;
  try {
    const u = await sql<{ floor_price: string }>`
      SELECT floor_price::text FROM ad_units
      WHERE id = ${params.adUnitId} AND publisher_id = ${params.publisherId}
      LIMIT 1
    `;
    unitFloor = u.rows[0] ? Number(u.rows[0].floor_price) : 0;
  } catch {
    unitFloor = 0;
  }

  const ruleFloors: Array<{ name: string; floor: number }> = [];
  let ruleMax = 0;
  try {
    const result = await sql<RuleRow>`
      SELECT id, name, floor_cpm::text, applies_to_sizes, applies_to_env
      FROM pricing_rules WHERE active = true
    `;
    for (const r of result.rows) {
      if (!ruleApplies(r, sizes, params.environment)) continue;
      const v = Number(r.floor_cpm);
      if (!Number.isFinite(v)) continue;
      ruleFloors.push({ name: r.name, floor: v });
      if (v > ruleMax) ruleMax = v;
    }
  } catch (e) {
    console.error("[floor-engine] rules load failed:", e);
  }

  const effective = Math.max(unitFloor, ruleMax);
  console.log("[floor]", "unit floor:", unitFloor, "rule floor:", ruleMax, "effective:", effective);
  return { unitFloor, ruleFloors, effective };
}
