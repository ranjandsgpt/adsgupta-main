"use client";

import { ResponsiveContainer as RC } from "recharts";

// Recharts types disagree with workspace @types/react; cast at boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeRC = RC as any;

export function ResponsiveContainer(props: Record<string, unknown>) {
  return <SafeRC {...props} />;
}
