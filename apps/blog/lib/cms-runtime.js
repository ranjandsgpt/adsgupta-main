/** True when Vercel Postgres env is available (CMS data layer). */
export function isPostgresConfigured() {
  return !!process.env.POSTGRES_URL;
}

/** @deprecated use isPostgresConfigured */
export const isSupabaseCmsEnabled = isPostgresConfigured;
