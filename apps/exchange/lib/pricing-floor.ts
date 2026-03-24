import { sql } from "@/lib/db";

type RuleRow = {
  floor_cpm: string;
  applies_to_sizes: string[] | null;
  applies_to_env: string | null;
};

function ruleApplies(rule: RuleRow, unitSizes: string[], unitEnv: string): boolean {
  const env = (rule.applies_to_env ?? "").trim().toLowerCase();
  if (env && env !== "all" && env !== unitEnv.toLowerCase()) return false;
  const sz = rule.applies_to_sizes;
  if (!sz || sz.length === 0) return true;
  const set = new Set(unitSizes.map((s) => s.trim().toLowerCase()));
  return sz.some((s) => set.has(String(s).trim().toLowerCase()));
}

/** Max floor from active pricing rules that match ad unit sizes + environment. */
export async function getEffectiveRuleFloor(unitSizes: string[], unitEnvironment: string): Promise<number> {
  try {
    const result = await sql<RuleRow>`
      SELECT floor_cpm::text, applies_to_sizes, applies_to_env
      FROM pricing_rules
      WHERE active = true
    `;
    let max = 0;
    for (const r of result.rows) {
      if (!ruleApplies(r, unitSizes, unitEnvironment)) continue;
      const v = Number(r.floor_cpm);
      if (Number.isFinite(v) && v > max) max = v;
    }
    return max;
  } catch (e) {
    console.error("[pricing-floor]", e);
    return 0;
  }
}
