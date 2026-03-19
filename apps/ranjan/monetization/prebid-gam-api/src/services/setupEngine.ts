import type { PrebidGamConfig, ExecutionResult } from '@/types';
import type { GamCredentials } from '@/lib/gam/types';
import type { IGamClient } from '@/lib/gam/client';
import { generateCpmBuckets } from '@/utils/cpmBuckets';
import { buildPrebidUniversalCreativeSnippet } from '@/utils/universalCreative';

export async function runPrebidGamSetup(
  client: IGamClient,
  creds: GamCredentials,
  config: PrebidGamConfig,
  dryRun: boolean
): Promise<ExecutionResult> {
  const lineItemIds: string[] = [];
  const creativeIds: string[] = [];
  const bidder = config.bidderCode;
  const sizes = config.adSizes.map((s) => {
    const [w, h] = s.replace(/[\[\]]/g, '').split('x').map(Number);
    return { width: w, height: h };
  });

  try {
    let advertiserId = config.advertiserId;
    if (!advertiserId) {
      const name = `Prebid_${bidder}`;
      const res = await client.createAdvertiser(creds, { name });
      if (!res.success || !res.id) return { success: false, lineItemIds: [], creativeIds: [], message: res.error };
      advertiserId = res.id;
    }

    const orderName = `prebid_${bidder}`;
    const orderRes = await client.createOrder(creds, { name: orderName, advertiserId });
    if (!orderRes.success || !orderRes.id) return { success: false, lineItemIds: [], creativeIds: [], advertiserId, message: orderRes.error };
    const orderId = orderRes.id;

    const buckets = generateCpmBuckets(
      config.cpmMin,
      config.cpmMax,
      config.hbPbGranularity,
      bidder,
      config.lineItemBaseName
    );

    const snippet = buildPrebidUniversalCreativeSnippet(config.hbFormatKey, config.kvpKeyName, config.hbAdidKey);
    const creativeName = config.creativeNameBase || `Prebid_${bidder}_Universal`;
    const creativeRes = await client.createCreative(creds, {
      name: creativeName,
      advertiserId,
      snippet,
      sizes,
    });
    if (!creativeRes.success || !creativeRes.id) return { success: false, advertiserId, orderId, lineItemIds, creativeIds, message: creativeRes.error };
    const creativeId = creativeRes.id;
    creativeIds.push(creativeId);

    for (const bucket of buckets) {
      const liRes = await client.createLineItem(creds, {
        name: bucket.lineItemName,
        orderId,
        cpmMicros: Math.round(bucket.price * 1_000_000),
        currency: config.currency,
        sizes,
        priority: config.lineItemPriority,
        kvpKey: config.kvpKeyName,
        kvpValue: bucket.price.toFixed(2),
        targetingType: config.targetingType,
      });
      if (!liRes.success) return { success: false, advertiserId, orderId, lineItemIds, creativeIds, message: liRes.error };
      if (liRes.id) lineItemIds.push(liRes.id);

      const attachRes = await client.attachCreativeToLineItem(creds, { lineItemId: liRes.id!, creativeId, sizes });
      if (!attachRes.success) return { success: false, advertiserId, orderId, lineItemIds, creativeIds, message: attachRes.error };
    }

    return { success: true, advertiserId, orderId, lineItemIds, creativeIds, dryRun };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, lineItemIds, creativeIds, message };
  }
}
