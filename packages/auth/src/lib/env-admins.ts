/**
 * Blog (and similar) hosts authenticate admins via plaintext env vars, not a user table:
 *   ADMIN_USER_1_EMAIL / ADMIN_USER_1_PASSWORD / ADMIN_USER_1_NAME
 *   ADMIN_USER_2_EMAIL / ADMIN_USER_2_PASSWORD / ADMIN_USER_2_NAME
 *
 * Central auth inherits the same credentials so blog passwords work on marketplace/audit.
 */

export type EnvAdmin = {
  email: string;
  password: string;
  name: string;
};

export function listEnvAdmins(): EnvAdmin[] {
  const out: EnvAdmin[] = [];

  for (let i = 1; i <= 5; i++) {
    const email = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    const password = process.env[`ADMIN_USER_${i}_PASSWORD`];
    const name =
      process.env[`ADMIN_USER_${i}_NAME`]?.trim() ||
      (email ? email.split('@')[0] : `Admin ${i}`);
    if (email && password) {
      out.push({ email, password, name });
    }
  }

  // Optional AdsGupta-wide aliases
  for (let i = 1; i <= 5; i++) {
    const email = process.env[`ADSGupta_ADMIN_${i}_EMAIL`]?.trim().toLowerCase()
      || process.env[`ADSGUPTA_ADMIN_${i}_EMAIL`]?.trim().toLowerCase();
    const password =
      process.env[`ADSGupta_ADMIN_${i}_PASSWORD`] ||
      process.env[`ADSGUPTA_ADMIN_${i}_PASSWORD`];
    const name =
      process.env[`ADSGupta_ADMIN_${i}_NAME`]?.trim() ||
      process.env[`ADSGUPTA_ADMIN_${i}_NAME`]?.trim() ||
      (email ? email.split('@')[0] : `Admin ${i}`);
    if (email && password && !out.some((u) => u.email === email)) {
      out.push({ email, password, name });
    }
  }

  return out;
}

export function matchEnvAdmin(
  email: string,
  password: string
): EnvAdmin | null {
  const normalized = email.trim().toLowerCase();
  return (
    listEnvAdmins().find(
      (u) => u.email === normalized && u.password === password
    ) || null
  );
}
