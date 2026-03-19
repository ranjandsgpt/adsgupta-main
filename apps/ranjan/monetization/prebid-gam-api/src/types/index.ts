export const AD_SIZES = [
  { w: 1, h: 1 },
  { w: 300, h: 250 },
  { w: 320, h: 50 },
  { w: 336, h: 280 },
  { w: 300, h: 600 },
  { w: 320, h: 100 },
  { w: 728, h: 90 },
  { w: 970, h: 250 },
  { w: 970, h: 90 },
  { w: 640, h: 360 },
  { w: 480, h: 320 },
  { w: 1920, h: 1080 },
] as const;

export type AdSize = (typeof AD_SIZES)[number];

export type TargetingType = 'PRICE_PRIORITY' | 'STANDARD';

export interface PrebidGamConfig {
  advertiserName: string;
  advertiserId?: string;
  orderName: string;
  lineItemBaseName: string;
  creativeNameBase: string;
  bidderCode: string;
  kvpKeyName: string;
  hbAdidKey: string;
  hbFormatKey: string;
  hbPbGranularity: number;
  cpmMin: number;
  cpmMax: number;
  adSizes: string[];
  currency: string;
  lineItemPriority: number;
  timezone: string;
  targetingType: TargetingType;
}

export interface ExecutionResult {
  success: boolean;
  advertiserId?: string;
  orderId?: string;
  lineItemIds: string[];
  creativeIds: string[];
  message?: string;
  dryRun?: boolean;
}

export interface CpmBucket {
  price: number;
  lineItemName: string;
}
