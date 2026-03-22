# STEP 0 — Bcrypt hashes for admin passwords

Run from `apps/blog` (uses `process.env` or defaults `changeme1` / `changeme2`):

```bash
node -e "console.log(require('bcryptjs').hashSync(process.env.ADMIN_USER_1_PASSWORD || 'changeme1', 10))"
node -e "console.log(require('bcryptjs').hashSync(process.env.ADMIN_USER_2_PASSWORD || 'changeme2', 10))"
```

**Store the bcrypt hash** (not plaintext) in Vercel / `.env.local`:

- `ADMIN_USER_1_PASSWORD` = output of command 1
- `ADMIN_USER_2_PASSWORD` = output of command 2

NextAuth compares the **login password** with `bcrypt.compare()` against these env values.

### Example outputs when env vars are unset (changeme1 / changeme2)

```
$2a$10$WVK9Xd7fbp/OkZeYSobTrOGMNVL7k58XsNB15zGykHQ4lGlJB72Eu
$2a$10$dZe00OJGcp7fsDG/fnIY9uUQfSRHUw5ZK3R8r3Z3ZqKa9alQta236
```

(Re-run locally to generate fresh salts.)
