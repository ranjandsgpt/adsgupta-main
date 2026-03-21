/** Whether CMS should use Supabase (vs legacy SQLite admin). */
export function isSupabaseCmsEnabled() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
