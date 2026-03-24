import { NextResponse } from "next/server";

export type JsonInit = {
  status?: number;
  headers?: Record<string, string>;
  /** When set, adds X-Response-Time */
  startedAt?: number;
};

function mergeHeaders(init?: JsonInit): Record<string, string> | undefined {
  if (!init?.headers && init?.startedAt == null) return undefined;
  const h: Record<string, string> = { ...(init.headers ?? {}) };
  if (init.startedAt != null) {
    h["X-Response-Time"] = `${Date.now() - init.startedAt}ms`;
  }
  return Object.keys(h).length ? h : undefined;
}

export function json(data: unknown, statusOrInit: number | JsonInit = 200, maybeInit?: JsonInit) {
  let status = 200;
  let init: JsonInit | undefined;
  if (typeof statusOrInit === "number") {
    status = statusOrInit;
    init = maybeInit;
  } else {
    init = statusOrInit;
    status = init.status ?? 200;
  }
  return NextResponse.json(data, { status, headers: mergeHeaders(init) });
}

export function badRequest(error: string, init?: JsonInit) {
  return json({ ok: false, error }, { status: 400, ...init });
}
