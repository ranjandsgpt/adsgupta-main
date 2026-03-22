/**
 * Initialize CMS tables. Run from `apps/blog`:
 *
 *   node scripts/init-db.cjs
 *
 * Set `POSTGRES_URL` in the environment (or load `.env.local` manually).
 */
async function main() {
  const { createTables } = await import("../lib/db-init.js");
  await createTables();
  console.log("Database tables created (or already exist).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
