(function (w, d) {
  "use strict";

  var VERSION = "1.0.0";
  var AUCTION = "https://exchange.adsgupta.com/api/openrtb/auction";
  var TRACK = "https://exchange.adsgupta.com/api/track";
  var SCHAIN_API = "https://exchange.adsgupta.com/api/schain";

  var mde = (w.mde = w.mde || {});
  var slots = [];
  var cfg = {};
  var displayed = new Set();
  var inFlight = new Set();

  function sessionId() {
    try {
      var k = "mde_sid";
      var s = sessionStorage.getItem(k);
      if (s) return s;
      s = "mde_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(k, s);
      return s;
    } catch (_) {
      return "mde_" + Math.random().toString(36).slice(2);
    }
  }

  function reqId() {
    return "r_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function parseSizes(sizes) {
    return (sizes || ["300x250"]).map(function (x) {
      var p = String(x).split("x");
      return { w: +p[0] || 300, h: +p[1] || 250 };
    });
  }

  function sizeMatches(slotSizes, bw, bh) {
    if (bw == null || bh == null) return false;
    var want = parseSizes(slotSizes);
    for (var i = 0; i < want.length; i++) {
      if (want[i].w === bw && want[i].h === bh) return true;
    }
    return false;
  }

  function fetchAuction(body) {
    return new Promise(function (resolve, reject) {
      var ctrl = new AbortController();
      var to = w.setTimeout(function () {
        ctrl.abort();
      }, 3000);

      fetch(AUCTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MDE-Version": VERSION
        },
        body: JSON.stringify(body),
        signal: ctrl.signal
      })
        .finally(function () {
          w.clearTimeout(to);
        })
        .then(function (r) {
          return r.json();
        })
        .then(resolve)
        .catch(reject);
    });
  }

  function fetchAuctionWithRetry(body) {
    return fetchAuction(body).catch(function () {
      return new Promise(function (resolve, reject) {
        w.setTimeout(function () {
          fetchAuction(body).then(resolve).catch(reject);
        }, 1000);
      });
    });
  }

  function fireImpressionEvent(unitId, price) {
    var payload = { type: "mde:impression", unitId: unitId, price: price };
    try {
      if (w.parent && w.parent !== w) {
        w.parent.postMessage(payload, "*");
      }
    } catch (_) {}
    try {
      w.postMessage(payload, "*");
    } catch (_) {}
  }

  function renderAd(divId, slot, bid, unitId) {
    var el = d.getElementById(divId);
    if (!el || !bid || !bid.adm) return;

    var bw = bid.w;
    var bh = bid.h;
    if (!sizeMatches(slot.sizes, bw, bh)) {
      return;
    }

    var price = bid.price;
    var f = d.createElement("iframe");
    f.width = String(bw);
    f.height = String(bh);
    f.frameBorder = "0";
    f.scrolling = "no";
    f.style.border = "none";
    f.style.display = "block";
    f.srcdoc = bid.adm;
    f.onload = function () {
      fireImpressionEvent(unitId, price);
    };
    el.appendChild(f);

    if (bid.id) {
      new Image().src = TRACK + "/impression?id=" + encodeURIComponent(bid.id);
    }
    if (bid.nurl) {
      try {
        var nu = bid.nurl.replace(/\$\{AUCTION_PRICE\}/g, String(price));
        fetch(nu, { method: "GET", mode: "no-cors" }).catch(function () {});
      } catch (_) {}
    }
  }

  function runSlot(divId, slot) {
    inFlight.delete(divId);
    if (displayed.has(divId)) return;
    displayed.add(divId);

    if (w.location.protocol === "http:") {
      console.warn("[mde] Non-HTTPS page; some features may be limited.");
    }

    var unitId = slot.unitId;
    var site = {
      page: w.location.href,
      domain: w.location.hostname
    };
    if (cfg.networkCode) {
      site.publisher = { id: cfg.networkCode };
    }

    var req = {
      id: reqId(),
      imp: [
        {
          id: reqId(),
          tagid: unitId,
          bidfloor: slot.floor != null ? slot.floor : 0.5,
          banner: { format: parseSizes(slot.sizes) },
          secure: w.location.protocol === "https:" ? 1 : 0
        }
      ],
      site: site,
      user: { id: sessionId() },
      device: { ua: navigator.userAgent, w: screen.width, h: screen.height },
      at: 2,
      tmax: 3000,
      source: { tid: reqId() }
    };

    function sendAuction(body) {
      fetchAuctionWithRetry(body)
        .then(function (res) {
          if (!res || !res.seatbid || !res.seatbid[0]) return;
          var sb = res.seatbid[0];
          if (!sb.bid || !sb.bid[0]) return;
          var bid = sb.bid[0];
          renderAd(divId, slot, bid, unitId);
        })
        .catch(function () {});
    }

    if (cfg.networkCode) {
      fetch(SCHAIN_API + "?publisherId=" + encodeURIComponent(cfg.networkCode), {
        method: "GET",
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (schain) {
          if (schain && schain.nodes) {
            req.source = req.source || {};
            req.source.schain = schain;
          }
          sendAuction(req);
        })
        .catch(function () {
          sendAuction(req);
        });
    } else {
      sendAuction(req);
    }
  }

  mde.init = function (c) {
    cfg = c || {};
  };
  mde.defineSlot = function (s) {
    slots.push(s);
  };
  mde.enableServices = function () {};
  mde.getVersion = function () {
    return VERSION;
  };

  mde.display = function (divId) {
    if (displayed.has(divId) || inFlight.has(divId)) return;

    var slot = slots.find(function (s) {
      return s.div === divId;
    });
    if (!slot) return;

    inFlight.add(divId);

    var io = w.IntersectionObserver;
    var el = d.getElementById(divId);
    if (!io || !el) {
      runSlot(divId, slot);
      return;
    }

    var obs = new io(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            obs.disconnect();
            runSlot(divId, slot);
            break;
          }
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );
    obs.observe(el);
  };

  var q = mde.cmd || [];
  mde.cmd = {
    push: function (fn) {
      try {
        fn();
      } catch (_) {}
    }
  };
  if (q.forEach) {
    q.forEach(function (fn) {
      try {
        fn();
      } catch (_) {}
    });
  }
})(window, document);
