import type { BidRequest, BidResponse } from '../../utils/openrtb-types';
import type { DSPAdapter, DSPConfig } from '../dsp-adapter.interface';
import { postJsonWithTimeout } from '../dsp-manager';

/**
 * TestBidderAdapter simulates a real DSP for development.
 * It points at a local Fastify server (see test-bidder-server.ts)
 * and returns synthetic bids for auction testing.
 */
export class TestBidderAdapter implements DSPAdapter {
  readonly dspId = 'test_bidder';
  readonly dspName = 'Test Bidder';
  readonly endpoint: string;

  private readonly config: DSPConfig;

  constructor() {
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

  isEnabled(): boolean {
    return this.config.active;
  }

  transformRequest(bidRequest: BidRequest): BidRequest {
    return bidRequest;
  }

  async sendBidRequest(bidRequest: BidRequest): Promise<BidResponse | null> {
    const raw = await postJsonWithTimeout<BidResponse>(
      this.config.endpoint,
      bidRequest,
      this.config.timeoutMs,
    );
    return this.parseResponse(raw);
  }

  parseResponse(rawResponse: any): BidResponse | null {
    if (!rawResponse || typeof rawResponse !== 'object') return null;
    if (!rawResponse.id || !rawResponse.seatbid) return null;
    return rawResponse as BidResponse;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await postJsonWithTimeout(this.config.endpoint, {}, 50);
      return true;
    } catch {
      return false;
    }
  }

  getConfig(): DSPConfig {
    return this.config;
  }
}

