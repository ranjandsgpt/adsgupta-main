/**
 * MDE (MyExchange) Prebid.js Adapter
 * Bidder code: 'mde'
 * endpoint: https://exchange.adsgupta.com/api/openrtb/auction
 */
/* eslint-disable */
(function () {
  "use strict";

  var ENDPOINT = "https://exchange.adsgupta.com/api/openrtb/auction";
  var BIDDER_CODE = "mde";

  function parseJsonSafe(s) {
    try {
      return typeof s === "string" ? JSON.parse(s) : s;
    } catch (e) {
      return null;
    }
  }

  function impFromBid(bid) {
    var imp = {
      id: bid.bidId || String(Math.random()).slice(2),
      tagid: bid.params.unitId,
      secure: typeof window !== "undefined" && window.location && window.location.protocol === "https:" ? 1 : 0
    };
    if (bid.params.floor != null && bid.params.floor !== "") {
      imp.bidfloor = Number(bid.params.floor);
    }
    if (bid.mediaTypes && bid.mediaTypes.banner) {
      var b = bid.mediaTypes.banner;
      if (b.sizes && b.sizes.length) {
        imp.banner = {
          format: b.sizes.map(function (sz) {
            return { w: sz[0], h: sz[1] };
          })
        };
      }
    }
    if (bid.mediaTypes && bid.mediaTypes.video) {
      var v = bid.mediaTypes.video;
      imp.video = {};
      if (v.playerSize && v.playerSize.length) {
        var ps = v.playerSize[0];
        imp.video.w = ps[0];
        imp.video.h = ps[1];
      }
      if (v.context) imp.video.placement = v.context === "instream" ? 1 : 3;
    }
    return imp;
  }

  var spec = {
    code: BIDDER_CODE,
    supportedMediaTypes: ["banner", "video"],
    isBidRequestValid: function (bid) {
      return !!(bid.params && bid.params.unitId && bid.params.networkCode);
    },
    buildRequests: function (validBidRequests, bidderRequest) {
      if (!validBidRequests || !validBidRequests.length) return [];

      var imps = [];
      for (var i = 0; i < validBidRequests.length; i++) {
        var br = validBidRequests[i];
        var imp = impFromBid(br);
        imp.id = br.bidId || imp.id;
        imps.push(imp);
      }

      var first = validBidRequests[0];
      var site = {
        page: bidderRequest.refererInfo && bidderRequest.refererInfo.referer,
        domain: bidderRequest.refererInfo && bidderRequest.refererInfo.domain,
        publisher: { id: first.params.networkCode }
      };

      var bidRequest = {
        id: bidderRequest.bidderRequestId || String(Math.random()).slice(2),
        imp: imps,
        site: site,
        user: {},
        device: {},
        at: 2,
        tmax: 800,
        source: {
          tid: bidderRequest.auctionId
        }
      };

      if (bidderRequest && bidderRequest.timeout) {
        bidRequest.tmax = Math.min(Number(bidderRequest.timeout) || 800, 3000);
      }

      if (bidderRequest.gdprConsent) {
        if (!bidRequest.regs) bidRequest.regs = {};
        if (bidderRequest.gdprConsent.gdprApplies != null) {
          bidRequest.regs.gdpr = bidderRequest.gdprConsent.gdprApplies ? 1 : 0;
        }
        var cs =
          bidderRequest.gdprConsent.consentString ||
          bidderRequest.gdprConsent.vendorData ||
          "";
        if (cs) bidRequest.user.consent = cs;
      }

      if (bidderRequest.uspConsent) {
        if (!bidRequest.regs) bidRequest.regs = {};
        bidRequest.regs.us_privacy = bidderRequest.uspConsent;
      }

      return {
        method: "POST",
        url: ENDPOINT,
        data: bidRequest,
        options: { contentType: "application/json" }
      };
    },
    interpretResponse: function (serverResponse, request) {
      var response =
        serverResponse && serverResponse.body != null ? serverResponse.body : serverResponse;
      response = parseJsonSafe(response) || response;
      if (!response || !response.seatbid || !response.seatbid.length) return [];

      var bids = [];
      for (var s = 0; s < response.seatbid.length; s++) {
        var seat = response.seatbid[s];
        if (!seat.bid) continue;
        for (var b = 0; b < seat.bid.length; b++) {
          var bid = seat.bid[b];
          if (bid == null) continue;
          var impid = bid.impid;
          bids.push({
            requestId: impid,
            cpm: Number(bid.price) || 0,
            currency: response.cur || "USD",
            width: bid.w,
            height: bid.h,
            ad: bid.adm,
            ttl: 300,
            creativeId: bid.crid || bid.adid,
            netRevenue: true,
            meta: { advertiserDomains: bid.adomain || [] }
          });
        }
      }
      return bids;
    },
    onBidWon: function (bid) {
      if (!bid || !bid.nurl) return;
      var price = bid.cpm != null ? bid.cpm : bid.originalCpm;
      var url = String(bid.nurl)
        .replace(/\$\{AUCTION_PRICE\}/gi, String(price))
        .replace(/%\24%7BAUCTION_PRICE%7D/gi, String(price));
      try {
        if (typeof pbjs !== "undefined" && pbjs.triggerPixel) {
          pbjs.triggerPixel(url);
        } else {
          new Image().src = url;
        }
      } catch (e) {}
    },
    getUserSyncs: function () {
      return [];
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = spec;
  if (typeof pbjs !== "undefined" && pbjs.registerBidAdapter) {
    pbjs.registerBidAdapter(spec, BIDDER_CODE);
  }
})();
