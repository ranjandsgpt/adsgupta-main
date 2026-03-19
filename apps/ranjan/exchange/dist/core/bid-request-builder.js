"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidRequestBuilder = void 0;
const crypto_1 = require("crypto");
/**
 * BidRequestBuilder is responsible for constructing a spec-compliant
 * OpenRTB 2.6 BidRequest from raw ad tag parameters and HTTP context.
 *
 * Design goal: keep this builder extremely fast (<5ms). It should do
 * minimal synchronous work and rely on cached publisher configuration.
 */
class BidRequestBuilder {
    constructor(deps) {
        this.deps = deps;
    }
    async buildBidRequest(rawSlots, ctx) {
        const auctionId = (0, crypto_1.randomUUID)();
        const publisherConfig = await this.deps.getPublisherConfig(ctx.publisherId);
        const impressions = rawSlots.map((slot, index) => {
            const id = slot.slotId || `imp-${index + 1}`;
            const primarySize = slot.sizes[0];
            const format = slot.sizes;
            const floorFromPublisher = publisherConfig?.floorPrices?.[`${primarySize.w}x${primarySize.h}`] ?? 0;
            const bidfloor = Math.max(floorFromPublisher, slot.floorUsd ?? 0);
            return {
                id,
                banner: {
                    w: primarySize.w,
                    h: primarySize.h,
                    format,
                    pos: 0,
                },
                bidfloor,
                bidfloorcur: 'USD',
                secure: 1,
            };
        });
        const site = {
            id: publisherConfig?.id ?? ctx.publisherId,
            domain: publisherConfig?.domain,
            page: ctx.pageUrl,
            ref: ctx.referrer,
            publisher: {
                id: publisherConfig?.id ?? ctx.publisherId,
                name: publisherConfig?.name,
                domain: publisherConfig?.domain,
            },
        };
        const device = {
            ua: ctx.userAgent,
            ip: ctx.ip,
            language: ctx.language,
            devicetype: 2,
            w: ctx.viewportWidth,
            h: ctx.viewportHeight,
            dnt: ctx.dnt ? 1 : 0,
        };
        const user = {
            id: undefined,
            buyeruid: undefined,
        };
        const regs = {
            coppa: ctx.coppa ? 1 : 0,
            ext: {
                gdpr: ctx.gdpr ? 1 : 0,
                us_privacy: ctx.usPrivacyString,
            },
        };
        const bidRequest = {
            id: auctionId,
            imp: impressions,
            site,
            device,
            user,
            at: 1,
            tmax: 120,
            cur: ['USD'],
            bcat: publisherConfig?.blockedCategories ?? [],
            badv: publisherConfig?.blockedAdvertisers ?? [],
            source: {
                fd: 1,
                tid: auctionId,
                pchain: '',
            },
            regs,
            ext: {
                exchange: 'adsgupta',
                version: '1.0',
            },
        };
        return { bidRequest, publisherConfig };
    }
}
exports.BidRequestBuilder = BidRequestBuilder;
