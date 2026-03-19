"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DSPManager = void 0;
exports.postJsonWithTimeout = postJsonWithTimeout;
const undici_1 = require("undici");
class DSPManager {
    constructor(adapters) {
        this.adapters = [];
        this.stats = new Map();
        this.adapters = adapters;
    }
    getActiveConfigs() {
        return this.adapters.filter((a) => a.isEnabled()).map((a) => a.getConfig());
    }
    async fanOutBidRequests(bidRequest) {
        const active = this.adapters.filter((a) => a.isEnabled());
        if (!active.length)
            return [];
        const tasks = active.map(async (adapter) => {
            const dspId = adapter.dspId;
            const started = Date.now();
            try {
                const resp = await adapter.sendBidRequest(adapter.transformRequest(bidRequest));
                this.recordStats(dspId, 'success');
                return { dspId, response: resp };
            }
            catch (err) {
                const isTimeout = err?.code === 'UND_ERR_REQ_ABORTED';
                this.recordStats(dspId, isTimeout ? 'timeout' : 'error');
                return { dspId, response: null };
            }
            finally {
                const latency = Date.now() - started;
                if (latency > 200) {
                    // eslint-disable-next-line no-console
                    console.warn(`[DSPManager] Slow DSP ${adapter.dspName} latency=${latency}ms`);
                }
            }
        });
        const settled = await Promise.allSettled(tasks);
        const results = [];
        for (const s of settled) {
            if (s.status === 'fulfilled') {
                results.push(s.value);
            }
        }
        return results;
    }
    recordStats(dspId, kind) {
        const current = this.stats.get(dspId) ?? { timeouts: 0, errors: 0, successes: 0 };
        if (kind === 'success')
            current.successes += 1;
        else if (kind === 'timeout')
            current.timeouts += 1;
        else
            current.errors += 1;
        this.stats.set(dspId, current);
    }
}
exports.DSPManager = DSPManager;
/**
 * Minimal helper to reuse undici with keep-alive. Adapters can
 * use this for their HTTP calls to DSPs.
 */
async function postJsonWithTimeout(url, body, timeoutMs, headers) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await (0, undici_1.request)(url, {
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
        const json = (await res.body.json());
        return json;
    }
    finally {
        clearTimeout(t);
    }
}
