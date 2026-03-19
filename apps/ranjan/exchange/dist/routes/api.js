"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApiRoutes = registerApiRoutes;
const metrics_store_1 = require("../services/metrics-store");
const API_KEY = process.env.EXCHANGE_API_KEY || '';
function requireApiKey(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        if (!API_KEY) {
            return;
        }
        const auth = request.headers.authorization;
        const key = typeof auth === 'string' && auth.startsWith('Bearer ')
            ? auth.slice(7)
            : request.query.apiKey;
        if (key !== API_KEY) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });
}
async function registerApiRoutes(fastify) {
    const api = fastify;
    api.register(async (instance) => {
        requireApiKey(instance);
        instance.get('/api/auctions', async (request, reply) => {
            const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '50', 10) || 50));
            const auctions = (0, metrics_store_1.getRecentAuctions)(limit);
            return reply.send({ auctions });
        });
        instance.get('/api/analytics/overview', async (_request, reply) => {
            const m = (0, metrics_store_1.getStatusMetrics)();
            return reply.send({
                total_requests: m.total_requests,
                total_fills: m.total_fills,
                fill_rate: m.fill_rate,
                auctions_last_hour: m.auctions_last_hour,
                avg_latency_ms: m.avg_latency_ms,
                total_revenue_cpm: m.total_revenue_cpm,
            });
        });
        instance.get('/api/health', async (_request, reply) => {
            const m = (0, metrics_store_1.getStatusMetrics)();
            return reply.send({
                status: 'healthy',
                version: process.env.npm_package_version || '0.1.0',
                uptime: process.uptime(),
                metrics: m,
            });
        });
    });
}
