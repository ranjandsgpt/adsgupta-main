"use strict";
/**
 * In-memory metrics store for /status and /api/analytics.
 * Tracks recent auctions and rolling stats for the last hour.
 * When DATABASE_URL is set, auctions can also be persisted via Prisma.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuction = recordAuction;
exports.getRecentAuctions = getRecentAuctions;
exports.getStatusMetrics = getStatusMetrics;
const MAX_RECENT_AUCTIONS = 200;
const HOUR_MS = 60 * 60 * 1000;
const recentAuctions = [];
let auctionsLastHour = 0;
let totalLatencyMs = 0;
let totalAuctionCalls = 0;
let totalFillCount = 0;
let totalRequestCount = 0;
let totalRevenueCpm = 0;
let lastHourStart = Date.now();
function trimHour() {
    const now = Date.now();
    if (now - lastHourStart >= HOUR_MS) {
        lastHourStart = now;
        auctionsLastHour = 0;
        totalLatencyMs = 0;
        totalAuctionCalls = 0;
        totalFillCount = 0;
        totalRequestCount = 0;
        totalRevenueCpm = 0;
    }
}
function recordAuction(summary) {
    const ts = Date.now();
    trimHour();
    auctionsLastHour += 1;
    totalAuctionCalls += 1;
    totalRequestCount += summary.requestCount;
    totalFillCount += summary.fillCount;
    totalLatencyMs += summary.latencyMs;
    totalRevenueCpm += summary.totalRevenue;
    recentAuctions.unshift({ ...summary, timestamp: ts });
    if (recentAuctions.length > MAX_RECENT_AUCTIONS) {
        recentAuctions.pop();
    }
}
function getRecentAuctions(limit = 50) {
    return recentAuctions.slice(0, limit);
}
function getStatusMetrics() {
    trimHour();
    const fillRate = totalRequestCount > 0 ? (totalFillCount / totalRequestCount) * 100 : 0;
    const avgLatencyMs = totalAuctionCalls > 0 ? Math.round(totalLatencyMs / totalAuctionCalls) : 0;
    return {
        auctions_last_hour: auctionsLastHour,
        avg_latency_ms: avgLatencyMs,
        fill_rate: Math.round(fillRate * 10) / 10,
        total_requests: totalRequestCount,
        total_fills: totalFillCount,
        total_revenue_cpm: Math.round(totalRevenueCpm * 100) / 100,
    };
}
