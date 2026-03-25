import { neon, Pool } from "@neondatabase/serverless";

let rawSql: ReturnType<typeof neon> | null = null;
let pool: Pool | null = null;

if (typeof window === "undefined" && !process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.error("[FATAL] POSTGRES_URL is not set. Exchange cannot function.");
}

function connectionString() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("POSTGRES_URL or DATABASE_URL is required");
  }
  return url;
}

function getRawSql() {
  if (!rawSql) {
    rawSql = neon(connectionString());
  }
  return rawSql;
}

/** Pooled client for high-frequency auction reads (Node runtime). */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: connectionString() });
  }
  return pool;
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

/** Single-query HTTP driver for admin CRUD and tagged `sql` template. */
export function getDb() {
  return getRawSql();
}
