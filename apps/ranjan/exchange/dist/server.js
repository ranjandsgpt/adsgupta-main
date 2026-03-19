"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const ad_request_1 = require("./routes/ad-request");
const beacon_1 = require("./routes/beacon");
const api_1 = require("./routes/api");
const test_bidder_1 = require("./integrations/adapters/test-bidder");
const metrics_store_1 = require("./services/metrics-store");
const PORT = Number(process.env.PORT || 3001);
async function buildServer() {
    const fastify = (0, fastify_1.default)({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
        },
    });
    await fastify.register(cors_1.default, {
        origin: true,
    });
    await fastify.register(helmet_1.default);
    await fastify.register(sensible_1.default);
    await fastify.register(rate_limit_1.default, {
        max: 1000,
        timeWindow: '1 minute',
    });
    const testAdapter = new test_bidder_1.TestBidderAdapter();
    await (0, ad_request_1.registerAdRequestRoute)(fastify, [testAdapter]);
    await (0, beacon_1.registerBeaconRoute)(fastify);
    await (0, api_1.registerApiRoutes)(fastify);
    fastify.get('/status', async () => {
        const metrics = (0, metrics_store_1.getStatusMetrics)();
        return {
            status: 'healthy',
            version: process.env.npm_package_version || '0.1.0',
            uptime: process.uptime(),
            auctions_last_hour: metrics.auctions_last_hour,
            active_dsps: 1,
            avg_latency_ms: metrics.avg_latency_ms,
            fill_rate: metrics.fill_rate,
        };
    });
    return fastify;
}
async function start() {
    try {
        const app = await buildServer();
        await app.listen({ port: PORT, host: '0.0.0.0' });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
    }
}
void start();
