export function normalizeDomain(raw: string): string | null {
  let s = String(raw ?? "")
    .trim()
    .toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.split("/")[0]?.split("?")[0]?.split(":")[0] ?? "";
  s = s.replace(/^www\./, "");
  if (!s) return null;
  if (s.length > 253) return null;
  const labels = s.split(".");
  for (const label of labels) {
    if (!label.length || label.length > 63) return null;
    if (!/^[a-z0-9-]+$/i.test(label)) return null;
    if (label.startsWith("-") || label.endsWith("-")) return null;
  }
  if (labels.length < 2 && !/^localhost$/i.test(s)) {
    return null;
  }
  if (!labels.every((l) => l.length > 0)) return null;
  return s;
}

export function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 320;
}
