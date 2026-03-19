export interface GamCredentials {
  networkCode: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt: Date;
}

export interface CreateAdvertiserInput {
  name: string;
}

export interface CreateOrderInput {
  name: string;
  advertiserId: string;
}

export interface CreateLineItemInput {
  name: string;
  orderId: string;
  cpmMicros: number;
  currency: string;
  sizes: { width: number; height: number }[];
  priority: number;
  kvpKey: string;
  kvpValue: string;
  targetingType: 'PRICE_PRIORITY' | 'STANDARD';
}

export interface CreateCreativeInput {
  name: string;
  advertiserId: string;
  snippet: string;
  sizes: { width: number; height: number }[];
}

export interface AttachCreativeInput {
  lineItemId: string;
  creativeId: string;
  sizes: { width: number; height: number }[];
}

export interface GamServiceResult<T = string> {
  success: boolean;
  id?: T;
  error?: string;
}
