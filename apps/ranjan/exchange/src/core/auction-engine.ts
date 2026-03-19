import type { BidRequest, BidResponse, Bid } from '../utils/openrtb-types';

export interface AuctionBidSummary {
  dspId: string;
  price: number;
  status: 'won' | 'lost' | 'invalid' | 'below_floor';
  reason?: string;
}

export interface ImpressionAuctionResult {
  impId: string;
  winner: {
    bidId: string;
    dspId: string;
    seatId: string;
    price: number;
    adMarkup: string;
    winNoticeUrl?: string;
    advertiserDomain?: string[];
    creativeId?: string;
    width?: number;
    height?: number;
  } | null;
  allBids: AuctionBidSummary[];
  secondPrice: number | null;
  bidCount: number;
  validBidCount: number;
}

export interface AuctionResult {
  auctionId: string;
  impressionResults: ImpressionAuctionResult[];
  timestamp: Date;
  latencyMs: number;
}

export interface AuctionEngineDeps {
  fireWinNotice(url: string): Promise<void>;
  logAuction(result: AuctionResult, bidRequest: BidRequest): Promise<void>;
}

interface CandidateBid {
  dspId: string;
  seatId: string;
  bid: Bid;
}

/**
 * AuctionEngine validates bids and runs a first‑price auction per impression.
 * It is designed to be CPU‑light so that the core decision logic completes
 * well under 10ms for typical bid counts.
 */
export class AuctionEngine {
  constructor(private readonly deps: AuctionEngineDeps) {}

  async runAuction(
    auctionId: string,
    bidRequest: BidRequest,
    responses: Array<{ dspId: string; response: BidResponse | null }>,
  ): Promise<AuctionResult> {
    const start = process.hrtime.bigint();
    const impMap = new Map(bidRequest.imp.map((imp) => [imp.id, imp]));
    const blockedAdvertisers = new Set(bidRequest.badv ?? []);
    const blockedCategories = new Set(bidRequest.bcat ?? []);

    const candidatesByImp = new Map<string, CandidateBid[]>();
    const summariesByImp = new Map<string, AuctionBidSummary[]>();

    const pushCandidate = (impid: string, candidate: CandidateBid) => {
      const arr = candidatesByImp.get(impid);
      if (arr) arr.push(candidate);
      else candidatesByImp.set(impid, [candidate]);
    };

    const pushSummary = (impid: string, summary: AuctionBidSummary) => {
      const arr = summariesByImp.get(impid);
      if (arr) arr.push(summary);
      else summariesByImp.set(impid, [summary]);
    };

    for (const { dspId, response } of responses) {
      if (!response?.seatbid) continue;

      for (const seatbid of response.seatbid) {
        const seatId = seatbid.seat ?? dspId;
        for (const bid of seatbid.bid) {
          const imp = impMap.get(bid.impid);
          if (!imp) {
            pushSummary(bid.impid, {
              dspId,
              price: bid.price,
              status: 'invalid',
              reason: 'unknown_imp',
            });
            continue;
          }

          if (!bid.adm || !bid.adm.trim()) {
            pushSummary(imp.id, {
              dspId,
              price: bid.price,
              status: 'invalid',
              reason: 'empty_adm',
            });
            continue;
          }

          if (!Number.isFinite(bid.price) || bid.price <= 0) {
            pushSummary(imp.id, {
              dspId,
              price: bid.price,
              status: 'invalid',
              reason: 'non_positive_price',
            });
            continue;
          }

          const floor = imp.bidfloor ?? 0;
          if (bid.price + 1e-6 < floor) {
            pushSummary(imp.id, {
              dspId,
              price: bid.price,
              status: 'below_floor',
              reason: `below_floor_${floor}`,
            });
            continue;
          }

          const adomain = bid.adomain ?? [];
          if (adomain.some((d) => blockedAdvertisers.has(d))) {
            pushSummary(imp.id, {
              dspId,
              price: bid.price,
              status: 'invalid',
              reason: 'blocked_adomain',
            });
            continue;
          }

          const cats = bid.cat ?? [];
          if (cats.some((c) => blockedCategories.has(c))) {
            pushSummary(imp.id, {
              dspId,
              price: bid.price,
              status: 'invalid',
              reason: 'blocked_category',
            });
            continue;
          }

          pushCandidate(imp.id, { dspId, seatId, bid });
        }
      }
    }

    const impressionResults: ImpressionAuctionResult[] = [];

    for (const imp of bidRequest.imp) {
      const candidates = (candidatesByImp.get(imp.id) ?? []).sort(
        (a, b) => b.bid.price - a.bid.price,
      );
      const summaries = summariesByImp.get(imp.id) ?? [];

      const bidCount = candidates.length + summaries.length;
      const validBidCount = candidates.length;

      let winner: ImpressionAuctionResult['winner'] = null;
      let secondPrice: number | null = null;

      if (candidates.length > 0) {
        const top = candidates[0];
        const second = candidates[1];
        secondPrice = second ? second.bid.price : null;

        winner = {
          bidId: top.bid.id,
          dspId: top.dspId,
          seatId: top.seatId,
          price: top.bid.price,
          adMarkup: top.bid.adm ?? '',
          winNoticeUrl: top.bid.nurl,
          advertiserDomain: top.bid.adomain,
          creativeId: top.bid.crid,
          width: top.bid.w,
          height: top.bid.h,
        };

        summaries.push({
          dspId: top.dspId,
          price: top.bid.price,
          status: 'won',
        });

        for (const losing of candidates.slice(1)) {
          summaries.push({
            dspId: losing.dspId,
            price: losing.bid.price,
            status: 'lost',
          });
        }
      }

      impressionResults.push({
        impId: imp.id,
        winner,
        allBids: summaries,
        secondPrice,
        bidCount,
        validBidCount,
      });
    }

    const end = process.hrtime.bigint();
    const latencyMs = Number(end - start) / 1_000_000;

    const result: AuctionResult = {
      auctionId,
      impressionResults,
      timestamp: new Date(),
      latencyMs,
    };

    for (const impResult of impressionResults) {
      const w = impResult.winner;
      if (w?.winNoticeUrl) {
        const priceMacro = encodeURIComponent(w.price.toFixed(4));
        const url = w.winNoticeUrl.replace(/\$\{AUCTION_PRICE\}/g, priceMacro);
        void this.deps.fireWinNotice(url);
      }
    }

    void this.deps.logAuction(result, bidRequest);

    return result;
  }
}

