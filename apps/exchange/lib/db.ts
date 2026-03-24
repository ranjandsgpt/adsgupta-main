import { neon } from "@neondatabase/serverless";

let rawSql: ReturnType<typeof neon> | null = null;

function getRawSql() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("POSTGRES_URL or DATABASE_URL is required");
  }
  if (!rawSql) {
    rawSql = neon(url);
  }
  return rawSql;
}

/**
 * Neon tagged-template SQL with the same `{ rows }` shape as the previous @vercel/postgres layer.
 * Every call is wrapped in try/catch for consistent logging.
 */
export async function sql<T extends Record<string, unknown> = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: T[] }> {
  try {
    const exec = getRawSql();
    const result = await exec(strings, ...values);
    if (Array.isArray(result)) {
      return { rows: result as unknown as T[] };
    }
    if (result != null && typeof result === "object") {
      return { rows: [result as unknown as T] };
    }
    return { rows: [] };
  } catch (e) {
    console.error("[exchange/db]", e);
    throw e;
  }
}

/** Expose raw neon client for advanced use (still uses same pool). */
export function getDb() {
  return getRawSql();
}
