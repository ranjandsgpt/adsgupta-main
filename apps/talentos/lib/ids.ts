import { randomBytes } from "crypto";

export function generateId(prefix = ""): string {
  const hex = randomBytes(6).toString("hex");
  return prefix ? `${prefix}_${hex}` : hex;
}
