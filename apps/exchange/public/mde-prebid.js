/**
 * MDE (MyExchange) Prebid.js bidder adapter
 * Bidder code: mde
 * Endpoint: POST https://exchange.adsgupta.com/api/openrtb/auction
 *
 * Load after prebid.js: <script src="https://exchange.adsgupta.com/mde-prebid.js"></script>
 * then: pbjs.bidderSettings = pbjs.bidderSettings || {}; pbjs.enableAnalytics(...); pbjs.addAdUnits(...); pbjs.requestBids(...);
 */
/* prebid lint: global pbjs */
(function () {
  "use strict";

  var ENDPOINT = "https://exchange.adsgupta.com/api/openrtb/auction";

  function parseSizesToFormat(sizes) {
    if (!sizes) return [{ w: 300, h: 250 }];
    var out = [];
    var list = sizes;
    if (typeof sizes === "string") {
      var p = sizes.split("x");
      if (p.length >= 2) return [{ w: +p[0] || 300, h: +p[1] || 250 }];
      return [{ w: 300, h: 250 }];
    }
    if (!Array.isArray(list[0])) list = [list];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (Array.isArray(s) && s.length >= 2) out.push({ w: +s[0] || 300, h: +s[1] || 250 });
    }
    return out.length ? out : [{ w: 300, h: 250 }];
  }

  function pageDomain(page) {
    try {
      return page ? new URL(page).hostname : "";
    } catch (_) {
      return "";
    }
  }

  var spec = {
    code: "mde",
    supportedMediaTypes: ["banner", "video"],

    isBidRequestValid: function (bid) {
      return !!(bid && bid.params && bid.params.unitId && bid.params.networkCode);
    },

    buildRequests: function (validBidRequests, bidderRequest) {
      if (!validBidRequests || !validBidRequests.length) return [];

      var page =
        (bidderRequest.refererInfo && (bidderRequest.refererInfo.page || bidderRequest.refererInfo.topmostLocation)) || "";
      var domain = pageDomain(page);
      var auctionId = bidderRequest.auctionId || "a_" + String(Date.now());

      var imps = [];
      for (var i = 0; i < validBidRequests.length; i++) {
        var bid = validBidRequests[i];
        var params = bid.params || {};
        var imp = {
          id: bid.bidId,
          tagid: String(params.unitId),
          secure: page.indexOf("https:") === 0 ? 1 : 0,
          bidfloor: typeof params.floor === "number" ? params.floor : parseFloat(params.floor || "0") || 0,
          bidfloorcur: "USD"
        };

        if (bid.mediaTypes && bid.mediaTypes.banner) {
          var bsizes =
            bid.mediaTypes.banner.sizes ||
            (bid.mediaTypes.banner.sizes === undefined && bid.sizes ? bid.sizes : null);
          imp.banner = { format: parseSizesToFormat(bsizes || [[300, 250]]) };
        }
        if (bid.mediaTypes && bid.mediaTypes.video) {
          var v = bid.mediaTypes.video;
          var pw = 640;
          var ph = 360;
          if (v.playerSize && Array.isArray(v.playerSize[0]) && v.playerSize[0].length >= 2) {
            pw = +v.playerSize[0][0] || 640;
            ph = +v.playerSize[0][1] || 360;
          }
          imp.video = {
            mimes: v.mimes || ["video/mp4", "application/javascript"],
            w: v.w || pw,
            h: v.h || ph,
            minduration: v.minduration || 1,
            maxduration: v.maxduration || 60,
            protocols: v.protocols || [2, 3, 5, 6]
          };
        }
        if (!imp.banner && !imp.video) {
          imp.banner = { format: parseSizesToFormat(bid.sizes || [[300, 250]]) };
        }
        imps.push(imp);
      }

      var firstParams = validBidRequests[0].params || {};
      var networkCode = String(firstParams.networkCode || "");

      var ortb = {
        id: auctionId,
        imp: imps,
        at: 2,
        tmax: 1200,
        site: {
          page: page,
          domain: domain
        },
        device: typeof navigator !== "undefined" ? { ua: navigator.userAgent } : {},
        user: { id: auctionId + "_pb" },
        source: {
          tid: auctionId,
          schain: {
            complete: 1,
            ver: "1.0",
            nodes: [{ asi: "exchange.adsgupta.com", sid: networkCode, hp: 1, rid: auctionId }]
          }
        }
      };

      if (networkCode) {
        ortb.site.publisher = { id: networkCode };
      }

      var gcs = bidderRequest.gdprConsent;
      if (gcs && gcs.gdprApplies) {
        ortb.regs = ortb.regs || {};
        ortb.regs.gdpr = 1;
        ortb.user = ortb.user || {};
        if (gcs.consentString) ortb.user.consent = gcs.consentString;
      }
      if (bidderRequest.uspConsent) {
        ortb.regs = ortb.regs || {};
        ortb.regs.us_privacy = bidderRequest.uspConsent;
      }

      return {
        method: "POST",
        url: ENDPOINT,
        data: ortb,
        options: { contentType: "application/json", withCredentials: false }
      };
    },

    interpretResponse: function (serverResponse, request) {
      var res = serverResponse && serverResponse.body;
      if (!res || !res.seatbid || !res.seatbid.length) return [];

      var bids = [];
      for (var s = 0; s < res.seatbid.length; s++) {
        var seat = res.seatbid[s];
        if (!seat || !seat.bid) continue;
        for (var i = 0; i < seat.bid.length; i++) {
          var b = seat.bid[i];
          if (b == null || b.price == null) continue;
          bids.push({
            requestId: b.impid,
            cpm: Number(b.price),
            currency: res.cur || "USD",
            width: b.w || 300,
            height: b.h || 250,
            ad: b.adm,
            ttl: 360,
            creativeId: b.crid || b.adid,
            netRevenue: true,
            adId: b.adid,
            nurl: b.nurl,
            meta: { advertiserDomains: b.adomain }
          });
        }
      }
      return bids;
    },

    onBidWon: function (bid) {
      if (!bid || !bid.nurl) return;
      var url = String(bid.nurl);
      var cpm = typeof bid.cpm !== "undefined" ? bid.cpm : bid.originalCpm || 0;
      url = url.replace(/\$\{AUCTION_PRICE\}/g, encodeURIComponent(String(cpm))).replace(/\$AUCTION_PRICE/g, String(cpm));
      try {
        var img = new Image();
        img.src = url;
      } catch (_) {}
    },

    getUserSyncs: function () {
      return [];
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = spec;
  if (typeof window !== "undefined" && window.pbjs && window.pbjs.registerBidAdapter) {
    window.pbjs.registerBidAdapter(spec, "mde");
  }
})();
