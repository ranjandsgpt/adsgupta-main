"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestBidderAdapter = void 0;
const dsp_manager_1 = require("../dsp-manager");
/**
 * TestBidderAdapter simulates a real DSP for development.
 * It points at a local Fastify server (see test-bidder-server.ts)
 * and returns synthetic bids for auction testing.
 */
class TestBidderAdapter {
    constructor() {
        this.dspId = 'test_bidder';
        this.dspName = 'Test Bidder';
        this.endpoint = process.env.TEST_BIDDER_ENDPOINT || 'http://localhost:3002/bid';
        this.config = {
            dspId: this.dspId,
            endpoint: this.endpoint,
            timeoutMs: 100,
            enabledFormats: ['banner'],
            enabledSizes: [],
            seatId: 'TEST',
            active: true,
        };
    }
    isEnabled() {
        return this.config.active;
    }
    transformRequest(bidRequest) {
        return bidRequest;
    }
    async sendBidRequest(bidRequest) {
        const raw = await (0, dsp_manager_1.postJsonWithTimeout)(this.config.endpoint, bidRequest, this.config.timeoutMs);
        return this.parseResponse(raw);
    }
    parseResponse(rawResponse) {
        if (!rawResponse || typeof rawResponse !== 'object')
            return null;
        if (!rawResponse.id || !rawResponse.seatbid)
            return null;
        return rawResponse;
    }
    async healthCheck() {
        try {
            await (0, dsp_manager_1.postJsonWithTimeout)(this.config.endpoint, {}, 50);
            return true;
        }
        catch {
            return false;
        }
    }
    getConfig() {
        return this.config;
    }
}
exports.TestBidderAdapter = TestBidderAdapter;
