/** Standard IAB display sizes allowed for ad units. */
export const IAB_STANDARD_SIZES = [
  "120x20",
  "120x60",
  "120x90",
  "120x240",
  "125x125",
  "160x50",
  "160x90",
  "160x600",
  "180x150",
  "200x90",
  "200x200",
  "234x60",
  "240x400",
  "250x250",
  "250x360",
  "300x50",
  "300x75",
  "300x250",
  "300x600",
  "300x1050",
  "320x50",
  "320x100",
  "320x480",
  "336x280",
  "468x60",
  "728x90",
  "768x1024",
  "970x90",
  "970x250",
  "1024x768",
  "1080x1920"
] as const;

const ALLOWED = new Set<string>(IAB_STANDARD_SIZES);

export function isValidIabSize(size: string): boolean {
  return ALLOWED.has(String(size).trim().toLowerCase());
}

export function validateIabSizes(sizes: unknown): sizes is string[] {
  if (!Array.isArray(sizes) || sizes.length === 0) return false;
  return sizes.every((s) => typeof s === "string" && isValidIabSize(s));
}
