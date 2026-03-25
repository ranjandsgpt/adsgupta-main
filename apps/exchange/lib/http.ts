import { headers } from "next/headers";
import { NextResponse } from "next/server";

export type JsonInit = {
  status?: number;
  headers?: Record<string, string>;
  /** When set, adds X-Response-Time (preferred over middleware clock) */
  startedAt?: number;
};

const REQ_START = "x-exchange-req-start";

function mergeHeaders(init?: JsonInit): Record<string, string> | undefined {
  const h: Record<string, string> = { ...(init?.headers ?? {}) };
  if (init?.startedAt != null) {
    h["X-Response-Time"] = `${Date.now() - init.startedAt}ms`;
  } else {
    try {
      const rh = headers();
      const start = rh.get(REQ_START);
      if (start != null && start !== "") {
        h["X-Response-Time"] = `${Date.now() - Number(start)}ms`;
      }
    } catch {
      /* outside request context */
    }
  }
  return Object.keys(h).length ? h : undefined;
}

/** Use with raw NextResponse.json when not using {@link json}. */
export function apiTimingHeaders(): Record<string, string> | undefined {
  try {
    const rh = headers();
    const start = rh.get(REQ_START);
    if (start == null || start === "") return undefined;
    return { "X-Response-Time": `${Date.now() - Number(start)}ms` };
  } catch {
    return undefined;
  }
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
