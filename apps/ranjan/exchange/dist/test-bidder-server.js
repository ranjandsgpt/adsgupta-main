"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const PORT = Number(process.env.TEST_BIDDER_PORT || 3002);
function randomDelay(minMs, maxMs) {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function buildTestBid(imp) {
    const floor = imp.bidfloor ?? 0.1;
    if (Math.random() > 0.7)
        return null; // 30% no-bid
    const price = floor + Math.random() * floor * 2;
    const size = imp.banner?.format?.[0] ?? { w: 300, h: 250 };
    const html = `<div style="width:${size.w}px;height:${size.h}px;background:#0f172a;color:#e5e7eb;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;font-size:14px;border-radius:8px;border:1px solid #38bdf8;">Test Ad · ${price.toFixed(2)} USD CPM</div>`;
    const bid = {
        id: `test-${imp.id}`,
        impid: imp.id,
        price,
        adid: 'test-ad',
        adm: html,
        adomain: ['example.com'],
        crid: 'test-cr',
        w: size.w,
        h: size.h,
        cat: ['IAB1'],
        attr: [],
    };
    return bid;
}
async function start() {
    const fastify = (0, fastify_1.default)({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
        },
    });
    fastify.post('/bid', async (request, reply) => {
        const req = request.body;
        await randomDelay(20, 80);
        const bids = [];
        for (const imp of req.imp) {
            const bid = buildTestBid(imp);
            if (bid)
                bids.push(bid);
        }
        if (!bids.length) {
            return reply.send({});
        }
        const seatbid = {
            seat: 'TEST',
            bid: bids,
        };
        const resp = {
            id: req.id,
            seatbid: [seatbid],
            cur: 'USD',
        };
        return reply.send(resp);
    });
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
}
void start();
