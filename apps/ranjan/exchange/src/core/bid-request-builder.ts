import { randomUUID } from 'crypto';
import type { BidRequest, Impression, Site, Device, User, Regs } from '../utils/openrtb-types';

export interface RawSlotRequest {
  slotId: string;
  sizes: Array<{ w: number; h: number }>;
  floorUsd?: number;
}

export interface RawAdRequestContext {
  publisherId: string;
  pageUrl: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  language?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  dnt?: boolean;
  gdpr?: boolean;
  usPrivacyString?: string;
  coppa?: boolean;
}

export interface PublisherConfig {
  id: string;
  domain: string;
  name?: string;
  floorPrices: Record<string, number>;
  blockedCategories: string[];
  blockedAdvertisers: string[];
}

export interface BidRequestBuilderDeps {
  /**
   * Fetch publisher configuration from cache or database.
   * Implemented elsewhere using Redis + PostgreSQL.
   */
  getPublisherConfig(publisherId: string): Promise<PublisherConfig | null>;
}

/**
 * BidRequestBuilder is responsible for constructing a spec-compliant
 * OpenRTB 2.6 BidRequest from raw ad tag parameters and HTTP context.
 *
 * Design goal: keep this builder extremely fast (<5ms). It should do
 * minimal synchronous work and rely on cached publisher configuration.
 */
export class BidRequestBuilder {
  constructor(private readonly deps: BidRequestBuilderDeps) {}

  async buildBidRequest(
    rawSlots: RawSlotRequest[],
    ctx: RawAdRequestContext,
  ): Promise<{ bidRequest: BidRequest; publisherConfig: PublisherConfig | null }> {
    const auctionId = randomUUID();
    const publisherConfig = await this.deps.getPublisherConfig(ctx.publisherId);

    const impressions: Impression[] = rawSlots.map((slot, index) => {
      const id = slot.slotId || `imp-${index + 1}`;
      const primarySize = slot.sizes[0];
      const format = slot.sizes;

      const floorFromPublisher =
        publisherConfig?.floorPrices?.[`${primarySize.w}x${primarySize.h}`] ?? 0;
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

    const site: Site = {
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

    const device: Device = {
      ua: ctx.userAgent,
      ip: ctx.ip,
      language: ctx.language,
      devicetype: 2,
      w: ctx.viewportWidth,
      h: ctx.viewportHeight,
      dnt: ctx.dnt ? 1 : 0,
    };

    const user: User = {
      id: undefined,
      buyeruid: undefined,
    };

    const regs: Regs = {
      coppa: ctx.coppa ? 1 : 0,
      ext: {
        gdpr: ctx.gdpr ? 1 : 0,
        us_privacy: ctx.usPrivacyString,
      },
    };

    const bidRequest: BidRequest = {
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

