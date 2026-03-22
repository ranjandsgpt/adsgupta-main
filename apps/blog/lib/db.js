/**
 * Neon serverless driver — `POSTGRES_URL` (pooled connection string).
 * @see https://neon.tech/docs/serverless/serverless-driver
 */
import { neon } from "@neondatabase/serverless";

let _neon = null;

function getNeon() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("POSTGRES_URL is not set");
  }
  if (!_neon) {
    _neon = neon(url);
  }
  return _neon;
}

/**
 * Tagged template SQL (Neon). Returns `{ rows, rowCount }` for compatibility with prior `@vercel/postgres` usage.
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values
 */
export function sql(strings, ...values) {
  const fn = getNeon();
  return fn(strings, ...values).then((result) => {
    const rows = Array.isArray(result) ? result : [];
    return { rows, rowCount: rows.length };
  });
}

/**
 * Parameterized query: `query('SELECT * FROM t WHERE id = $1', [id])`
 * @param {string} text
 * @param {unknown[]} [params]
 */
export async function query(text, params = []) {
  const fn = getNeon();
  const result = await fn(text, params);
  const rows = Array.isArray(result) ? result : [];
  return { rows, rowCount: rows.length };
}
