import type { BidRequest, BidResponse } from '../utils/openrtb-types';

export interface DSPConfig {
  dspId: string;
  endpoint: string;
  apiKey?: string;
  timeoutMs: number;
  maxQps?: number;
  enabledFormats: Array<'banner' | 'native'>;
  enabledSizes: Array<{ w: number; h: number }>;
  minFloor?: number;
  seatId: string;
  active: boolean;
}

export interface DSPAdapter {
  readonly dspId: string;
  readonly dspName: string;
  readonly endpoint: string;

  isEnabled(): boolean;
  transformRequest(bidRequest: BidRequest): BidRequest;
  sendBidRequest(bidRequest: BidRequest): Promise<BidResponse | null>;
  parseResponse(rawResponse: unknown): BidResponse | null;
  healthCheck(): Promise<boolean>;
  getConfig(): DSPConfig;
}

