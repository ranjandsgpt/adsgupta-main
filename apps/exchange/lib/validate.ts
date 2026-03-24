export function validateRequired(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const v = body[field];
    if (v === undefined || v === null || (typeof v === "string" && !String(v).trim())) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateDomain(domain: string): boolean {
  return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(domain.toLowerCase());
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateCpm(cpm: number): boolean {
  return typeof cpm === "number" && cpm >= 0.01 && cpm <= 1000;
}
