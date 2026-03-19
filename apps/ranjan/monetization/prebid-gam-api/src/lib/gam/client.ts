import type {
  GamCredentials,
  CreateAdvertiserInput,
  CreateOrderInput,
  CreateLineItemInput,
  CreateCreativeInput,
  AttachCreativeInput,
  GamServiceResult,
} from './types';

/**
 * GAM API client interface. Implement with SOAP (official GAM API) or REST if available.
 * Google Ad Manager uses SOAP; see https://developers.google.com/ad-manager/api/start
 */
export interface IGamClient {
  createAdvertiser(creds: GamCredentials, input: CreateAdvertiserInput): Promise<GamServiceResult>;
  createOrder(creds: GamCredentials, input: CreateOrderInput): Promise<GamServiceResult>;
  createLineItem(creds: GamCredentials, input: CreateLineItemInput): Promise<GamServiceResult>;
  createCreative(creds: GamCredentials, input: CreateCreativeInput): Promise<GamServiceResult>;
  attachCreativeToLineItem(creds: GamCredentials, input: AttachCreativeInput): Promise<GamServiceResult>;
}

/** In-memory stub for dry run; returns fake IDs without calling GAM */
export class GamClientStub implements IGamClient {
  private counter = 0;
  private nextId(): string {
    this.counter += 1;
    return `stub_${this.counter}_${Date.now()}`;
  }

  async createAdvertiser(): Promise<GamServiceResult> {
    return { success: true, id: this.nextId() };
  }
  async createOrder(): Promise<GamServiceResult> {
    return { success: true, id: this.nextId() };
  }
  async createLineItem(): Promise<GamServiceResult> {
    return { success: true, id: this.nextId() };
  }
  async createCreative(): Promise<GamServiceResult> {
    return { success: true, id: this.nextId() };
  }
  async attachCreativeToLineItem(): Promise<GamServiceResult> {
    return { success: true };
  }
}

import {
  soapCreateCompanies,
  soapCreateOrders,
  soapCreateLineItems,
  soapCreateCreatives,
  soapCreateLineItemCreativeAssociations,
} from './soapClient';

/**
 * Live GAM SOAP client (v202511). Uses CompanyService, OrderService, LineItemService,
 * CreativeService, LineItemCreativeAssociationService with OAuth Bearer token.
 */
export class GamSoapClient implements IGamClient {
  constructor(private _baseUrl?: string) {}

  async createAdvertiser(creds: GamCredentials, input: CreateAdvertiserInput): Promise<GamServiceResult> {
    return soapCreateCompanies(creds, input.name);
  }
  async createOrder(creds: GamCredentials, input: CreateOrderInput): Promise<GamServiceResult> {
    return soapCreateOrders(creds, input.name, input.advertiserId);
  }
  async createLineItem(creds: GamCredentials, input: CreateLineItemInput): Promise<GamServiceResult> {
    return soapCreateLineItems(creds, {
      name: input.name,
      orderId: input.orderId,
      cpmMicros: input.cpmMicros,
      currency: input.currency,
      sizes: input.sizes,
      priority: input.priority,
      targetingType: input.targetingType,
    });
  }
  async createCreative(creds: GamCredentials, input: CreateCreativeInput): Promise<GamServiceResult> {
    return soapCreateCreatives(creds, {
      name: input.name,
      advertiserId: input.advertiserId,
      snippet: input.snippet,
      sizes: input.sizes,
    });
  }
  async attachCreativeToLineItem(creds: GamCredentials, input: AttachCreativeInput): Promise<GamServiceResult> {
    return soapCreateLineItemCreativeAssociations(creds, {
      lineItemId: input.lineItemId,
      creativeId: input.creativeId,
      sizes: input.sizes,
    });
  }
}
