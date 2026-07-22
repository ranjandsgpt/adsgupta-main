import bcrypt from 'bcryptjs';

/**
 * Temporary: store passwords in plaintext in `password_hash` so they can be
 * inspected / edited in Supabase. Re-hash before production hardening.
 */
export function toStoredPassword(plain: string): string {
  return plain;
}

function looksLikeBcrypt(value: string): boolean {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
}

/** Accept plaintext match, or legacy bcrypt hashes until rows are rewritten. */
export async function verifyStoredPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  if (looksLikeBcrypt(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

export function isLegacyBcryptHash(stored: string): boolean {
  return looksLikeBcrypt(stored);
}
