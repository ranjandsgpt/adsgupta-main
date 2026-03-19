/**
 * GAM SOAP API v202511 – low-level helpers.
 * Uses node-soap with OAuth Bearer token and RequestHeader (networkCode, applicationName).
 */
import soap from 'soap';
import type { GamCredentials } from './types';

const GAM_NS = 'https://www.google.com/apis/ads/publisher/v202511';
const WSDL_BASE = 'https://ads.google.com/apis/ads/publisher/v202511';
const APP_NAME = 'PrebidGAMAPI';

function wsdlUrl(service: string): string {
  return `${WSDL_BASE}/${service}?wsdl`;
}

function createClient(wsdl: string, accessToken: string): Promise<soap.Client> {
  return new Promise((resolve, reject) => {
    soap.createClient(
      wsdl,
      {
        wsdl_headers: { Authorization: `Bearer ${accessToken}` },
        escapeXML: false,
      },
      (err, client) => {
        if (err) return reject(err);
        if (!client) return reject(new Error('Soap client not created'));
        resolve(client);
      }
    );
  });
}

function addRequestHeader(client: soap.Client, networkCode: string): void {
  client.addSoapHeader(
    { networkCode, applicationName: APP_NAME },
    'RequestHeader',
    GAM_NS
  );
}

function toGamDateTime(d: Date): { date: { year: number; month: number; day: number }; hour: number; minute: number; second: number; timeZoneID: string } {
  return {
    date: { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() },
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    timeZoneID: 'America/Los_Angeles',
  };
}

/** Create companies (advertisers). Returns first created company id. */
export async function soapCreateCompanies(
  creds: GamCredentials,
  name: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const client = await createClient(wsdlUrl('CompanyService'), creds.accessToken);
    addRequestHeader(client, creds.networkCode);
    const [result] = await new Promise<[unknown, string, unknown]>((resolve, reject) => {
      client.createCompanies(
        { companies: [{ name, type: 'ADVERTISER' }] },
        (err: Error | null, res: unknown, raw: string, soapHeader: unknown) => {
          if (err) reject(err);
          else resolve([res, raw, soapHeader]);
        }
      );
    });
    const rval = (result as { rval?: Array<{ id?: number }> })?.rval;
    const id = Array.isArray(rval) && rval[0]?.id != null ? String(rval[0].id) : undefined;
    return id ? { success: true, id } : { success: false, error: 'No company id in response' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

/** Create orders. Returns first created order id. */
export async function soapCreateOrders(
  creds: GamCredentials,
  name: string,
  advertiserId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const client = await createClient(wsdlUrl('OrderService'), creds.accessToken);
    addRequestHeader(client, creds.networkCode);
    const [result] = await new Promise<[unknown, string, unknown]>((resolve, reject) => {
      client.createOrders(
        {
          orders: [
            {
              name,
              advertiserId: parseInt(advertiserId, 10),
            },
          ],
        },
        (err: Error | null, res: unknown, raw: string, soapHeader: unknown) => {
          if (err) reject(err);
          else resolve([res, raw, soapHeader]);
        }
      );
    });
    const rval = (result as { rval?: Array<{ id?: number }> })?.rval;
    const id = Array.isArray(rval) && rval[0]?.id != null ? String(rval[0].id) : undefined;
    return id ? { success: true, id } : { success: false, error: 'No order id in response' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

/** Create line items. One item per call; returns created line item id. */
export async function soapCreateLineItems(
  creds: GamCredentials,
  input: {
    name: string;
    orderId: string;
    cpmMicros: number;
    currency: string;
    sizes: { width: number; height: number }[];
    priority: number;
    targetingType: 'PRICE_PRIORITY' | 'STANDARD';
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const client = await createClient(wsdlUrl('LineItemService'), creds.accessToken);
    addRequestHeader(client, creds.networkCode);
    const now = new Date();
    const oneYear = new Date(now);
    oneYear.setFullYear(oneYear.getFullYear() + 1);
    const lineItemType = input.targetingType === 'PRICE_PRIORITY' ? 'PRICE_PRIORITY' : 'STANDARD';
    const lineItem = {
      orderId: parseInt(input.orderId, 10),
      name: input.name,
      startDateTime: toGamDateTime(now),
      startDateTimeType: 'IMMEDIATELY',
      endDateTime: toGamDateTime(oneYear),
      lineItemType,
      costType: 'CPM',
      costPerUnit: { currencyCode: input.currency, microAmount: input.cpmMicros },
      creativeRotationType: 'EVEN',
      priority: input.priority,
      unitsBought: 999999999,
      creativePlaceholders: input.sizes.map((s) => ({
        size: { width: s.width, height: s.height },
      })),
    };
    const [result] = await new Promise<[unknown, string, unknown]>((resolve, reject) => {
      client.createLineItems({ lineItems: [lineItem] }, (err: Error | null, res: unknown, raw: string, soapHeader: unknown) => {
        if (err) reject(err);
        else resolve([res, raw, soapHeader]);
      });
    });
    const rval = (result as { rval?: Array<{ id?: number }> })?.rval;
    const id = Array.isArray(rval) && rval[0]?.id != null ? String(rval[0].id) : undefined;
    return id ? { success: true, id } : { success: false, error: 'No line item id in response' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

/** Create creatives (third-party HTML). Returns first created creative id. */
export async function soapCreateCreatives(
  creds: GamCredentials,
  input: {
    name: string;
    advertiserId: string;
    snippet: string;
    sizes: { width: number; height: number }[];
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const client = await createClient(wsdlUrl('CreativeService'), creds.accessToken);
    addRequestHeader(client, creds.networkCode);
    const creative = {
      xsi_type: 'ThirdPartyCreative',
      name: input.name,
      advertiserId: parseInt(input.advertiserId, 10),
      snippet: input.snippet,
      size: input.sizes[0] ? { width: input.sizes[0].width, height: input.sizes[0].height } : { width: 300, height: 250 },
    };
    const [result] = await new Promise<[unknown, string, unknown]>((resolve, reject) => {
      client.createCreatives({ creatives: [creative] }, (err: Error | null, res: unknown, raw: string, soapHeader: unknown) => {
        if (err) reject(err);
        else resolve([res, raw, soapHeader]);
      });
    });
    const rval = (result as { rval?: Array<{ id?: number }> })?.rval;
    const id = Array.isArray(rval) && rval[0]?.id != null ? String(rval[0].id) : undefined;
    return id ? { success: true, id } : { success: false, error: 'No creative id in response' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

/** Create line item creative associations. */
export async function soapCreateLineItemCreativeAssociations(
  creds: GamCredentials,
  input: { lineItemId: string; creativeId: string; sizes: { width: number; height: number }[] }
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await createClient(wsdlUrl('LineItemCreativeAssociationService'), creds.accessToken);
    addRequestHeader(client, creds.networkCode);
    const size = input.sizes[0] ?? { width: 300, height: 250 };
    const lica = {
      lineItemId: parseInt(input.lineItemId, 10),
      creativeId: parseInt(input.creativeId, 10),
      creativeSize: { width: size.width, height: size.height },
    };
    await new Promise<void>((resolve, reject) => {
      client.createLineItemCreativeAssociations(
        { lineItemCreativeAssociations: [lica] },
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
