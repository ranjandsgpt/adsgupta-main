import { request } from 'undici';
import type { BidRequest, BidResponse } from '../utils/openrtb-types';
import type { DSPAdapter, DSPConfig } from './dsp-adapter.interface';

export interface FanOutResult {
  dspId: string;
  response: BidResponse | null;
}

interface DSPStats {
  timeouts: number;
  errors: number;
  successes: number;
}

export class DSPManager {
  private adapters: DSPAdapter[] = [];
  private stats = new Map<string, DSPStats>();

  constructor(adapters: DSPAdapter[]) {
    this.adapters = adapters;
  }

  getActiveConfigs(): DSPConfig[] {
    return this.adapters.filter((a) => a.isEnabled()).map((a) => a.getConfig());
  }

  async fanOutBidRequests(bidRequest: BidRequest): Promise<FanOutResult[]> {
    const active = this.adapters.filter((a) => a.isEnabled());
    if (!active.length) return [];

    const tasks = active.map(async (adapter) => {
      const dspId = adapter.dspId;
      const started = Date.now();
      try {
        const resp = await adapter.sendBidRequest(adapter.transformRequest(bidRequest));
        this.recordStats(dspId, 'success');
        return { dspId, response: resp };
      } catch (err: any) {
        const isTimeout = err?.code === 'UND_ERR_REQ_ABORTED';
        this.recordStats(dspId, isTimeout ? 'timeout' : 'error');
        return { dspId, response: null };
      } finally {
        const latency = Date.now() - started;
        if (latency > 200) {
          // eslint-disable-next-line no-console
          console.warn(`[DSPManager] Slow DSP ${adapter.dspName} latency=${latency}ms`);
        }
      }
    });

    const settled = await Promise.allSettled(tasks);
    const results: FanOutResult[] = [];
    for (const s of settled) {
      if (s.status === 'fulfilled') {
        results.push(s.value);
      }
    }
    return results;
  }

  private recordStats(dspId: string, kind: 'success' | 'timeout' | 'error') {
    const current = this.stats.get(dspId) ?? { timeouts: 0, errors: 0, successes: 0 };
    if (kind === 'success') current.successes += 1;
    else if (kind === 'timeout') current.timeouts += 1;
    else current.errors += 1;
    this.stats.set(dspId, current);
  }
}

/**
 * Minimal helper to reuse undici with keep-alive. Adapters can
 * use this for their HTTP calls to DSPs.
 */
export async function postJsonWithTimeout<T>(
  url: string,
  body: unknown,
  timeoutMs: number,
  headers?: Record<string, string>,
): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(`HTTP ${res.statusCode}`);
    }

    const json = (await res.body.json()) as T;
    return json;
  } finally {
    clearTimeout(t);
  }
}

