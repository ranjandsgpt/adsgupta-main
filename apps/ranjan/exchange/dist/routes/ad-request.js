"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdRequestRoute = registerAdRequestRoute;
const bid_request_builder_1 = require("../core/bid-request-builder");
const auction_engine_1 = require("../core/auction-engine");
const dsp_manager_1 = require("../integrations/dsp-manager");
const metrics_store_1 = require("../services/metrics-store");
/**
 * Very small in-memory publisher config stub.
 * In a full implementation this would be backed by Redis + Postgres.
 */
const publisherConfigs = new Map([
    [
        'demo_pub',
        {
            id: 'demo_pub',
            domain: 'example.com',
            name: 'Demo Publisher',
            floorPrices: {
                '300x250': 0.5,
            },
            blockedCategories: [],
            blockedAdvertisers: [],
        },
    ],
]);
async function registerAdRequestRoute(fastify, dspAdapters) {
    const builder = new bid_request_builder_1.BidRequestBuilder({
        async getPublisherConfig(publisherId) {
            return publisherConfigs.get(publisherId) ?? null;
        },
    });
    const dspManager = new dsp_manager_1.DSPManager(dspAdapters);
    const auctionEngine = new auction_engine_1.AuctionEngine({
        async fireWinNotice(url) {
            try {
                await fetch(url).catch(() => undefined);
            }
            catch {
                // ignore
            }
        },
        async logAuction() {
            // TODO: persist to Postgres in later phase
            return;
        },
    });
    fastify.get('/ad-request', async (request, reply) => {
        const started = Date.now();
        const q = request.query || {};
        const publisherId = String(q.pub || 'demo_pub');
        let slots = [];
        try {
            if (typeof q.slots === 'string') {
                slots = JSON.parse(q.slots);
            }
        }
        catch {
            slots = [];
        }
        const rawSlots = slots.map((s) => ({
            slotId: s.id,
            sizes: (s.sizes || []).map((size) => {
                const [w, h] = String(size).split('x').map((n) => parseInt(n, 10));
                return { w, h };
            }),
            floorUsd: typeof s.floor === 'number' ? s.floor : undefined,
        }));
        const ctx = {
            publisherId,
            pageUrl: String(q.page || ''),
            referrer: typeof q.ref === 'string' ? q.ref : undefined,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            language: request.headers['accept-language'],
            viewportWidth: q.sw ? Number(q.sw) : undefined,
            viewportHeight: q.sh ? Number(q.sh) : undefined,
            dnt: q.dnt === '1',
        };
        const { bidRequest } = await builder.buildBidRequest(rawSlots, ctx);
        const fanOutResults = await dspManager.fanOutBidRequests(bidRequest);
        const responses = fanOutResults;
        const auctionResult = await auctionEngine.runAuction(bidRequest.id, bidRequest, responses);
        const slotsResponse = auctionResult.impressionResults.map((imp) => {
            if (!imp.winner) {
                return {
                    slotId: imp.impId,
                    filled: false,
                };
            }
            return {
                slotId: imp.impId,
                filled: true,
                creative: imp.winner.adMarkup,
                width: imp.winner.width,
                height: imp.winner.height,
                impressionBeacon: `/beacon?type=imp&auc=${encodeURIComponent(auctionResult.auctionId)}&imp=${encodeURIComponent(imp.impId)}`,
                viewabilityBeacon: `/beacon?type=view&auc=${encodeURIComponent(auctionResult.auctionId)}&imp=${encodeURIComponent(imp.impId)}`,
                clickBeacon: `/beacon?type=click&auc=${encodeURIComponent(auctionResult.auctionId)}&imp=${encodeURIComponent(imp.impId)}`,
            };
        });
        const latency = Date.now() - started;
        const fillCount = auctionResult.impressionResults.filter((r) => r.winner).length;
        const totalRevenue = auctionResult.impressionResults.reduce((sum, r) => sum + (r.winner?.price ?? 0), 0);
        const winnerDsp = auctionResult.impressionResults.find((r) => r.winner)?.winner?.dspId ?? null;
        const bidCount = auctionResult.impressionResults.reduce((sum, r) => sum + r.bidCount, 0);
        (0, metrics_store_1.recordAuction)({
            auctionId: auctionResult.auctionId,
            publisherId,
            requestCount: auctionResult.impressionResults.length,
            fillCount,
            totalRevenue,
            latencyMs: latency,
            winnerDsp,
            bidCount,
        });
        reply
            .header('Access-Control-Allow-Origin', '*')
            .header('Cache-Control', 'no-store')
            .header('X-Auction-Id', auctionResult.auctionId)
            .header('X-Response-Time', `${latency}ms`)
            .send({ slots: slotsResponse });
    });
}
