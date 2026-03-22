# Admin passwords (env vars)

`ADMIN_USER_1_PASSWORD` and `ADMIN_USER_2_PASSWORD` are **plaintext** values. NextAuth compares the login form password with `===` against these env vars (two internal users only).

Set in Vercel / `.env.local`:

- `ADMIN_USER_1_EMAIL`, `ADMIN_USER_1_PASSWORD`, `ADMIN_USER_1_NAME`, `ADMIN_USER_1_SUBDOMAIN`
- `ADMIN_USER_2_EMAIL`, `ADMIN_USER_2_PASSWORD`, `ADMIN_USER_2_NAME`, `ADMIN_USER_2_SUBDOMAIN`

If you previously stored bcrypt hashes in these variables, replace them with the actual plaintext passwords or login will fail.
