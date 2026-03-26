/**
 * AdsGupta MDE — publisher tag v1.0.0
 * Collects device, page, session, engagement, viewability, geo, and consent signals
 * for every OpenRTB bid request. See /docs/mde-js-reference
 */
(function (w, d) {
  "use strict";

  var VERSION = "1.0.0";
  var DEFAULT_AUCTION = "https://exchange.adsgupta.com/api/openrtb/auction";
  var TRACK_BASE = "https://exchange.adsgupta.com/api/track";

  var mde = (w.mde = w.mde || {});
  var slots = [];
  var cfg = { auctionUrl: DEFAULT_AUCTION };
  var displayed = new Set();
  var inFlight = new Set();

  /** --- Engagement (page-level, mutable) --- */
  var engagement = {
    mouseActivity: false,
    touchActivity: false,
    keyboardActivity: false,
    scrollDepth: 0,
    timeVisible: 0,
    idleTime: 0
  };

  var lastInteract = Date.now();
  var visibleAccumStart = d.visibilityState === "visible" ? Date.now() : null;

  function bindEngagementOnce() {
    if (bindEngagementOnce.done) return;
    bindEngagementOnce.done = true;
    d.addEventListener(
      "mousemove",
      function () {
        engagement.mouseActivity = true;
        lastInteract = Date.now();
      },
      { passive: true }
    );
    d.addEventListener(
      "touchstart",
      function () {
        engagement.touchActivity = true;
        lastInteract = Date.now();
      },
      { passive: true }
    );
    d.addEventListener("keydown", function () {
      engagement.keyboardActivity = true;
      lastInteract = Date.now();
    });
    w.addEventListener(
      "scroll",
      function () {
        var sh = d.documentElement.scrollHeight - w.innerHeight;
        var pct = sh <= 0 ? 0 : Math.round((w.scrollY / sh) * 100);
        if (pct > engagement.scrollDepth) engagement.scrollDepth = pct;
        lastInteract = Date.now();
      },
      { passive: true }
    );
    d.addEventListener("visibilitychange", function () {
      if (d.visibilityState === "visible") {
        visibleAccumStart = Date.now();
      } else if (visibleAccumStart) {
        engagement.timeVisible += Math.floor((Date.now() - visibleAccumStart) / 1000);
        visibleAccumStart = null;
      }
    });
    setInterval(function () {
      var idle = Math.floor((Date.now() - lastInteract) / 1000);
      engagement.idleTime = idle;
      if (d.visibilityState === "visible" && visibleAccumStart) {
        engagement.timeVisible += 1;
        visibleAccumStart = Date.now();
      }
    }, 1000);
  }

  function getOrCreateSessionId() {
    try {
      var id = sessionStorage.getItem("mde_sid");
      if (!id) {
        id = w.crypto && w.crypto.randomUUID ? w.crypto.randomUUID() : "mde_" + reqId();
        sessionStorage.setItem("mde_sid", id);
      }
      if (!sessionStorage.getItem("mde_session_start")) {
        sessionStorage.setItem("mde_session_start", String(Date.now()));
      }
      return id;
    } catch (_) {
      return "mde_sess_" + reqId();
    }
  }

  function getOrCreateUserId() {
    try {
      var id = localStorage.getItem("mde_uid");
      if (!id) {
        id = w.crypto && w.crypto.randomUUID ? w.crypto.randomUUID() : "mde_u_" + reqId();
        localStorage.setItem("mde_uid", id);
        localStorage.setItem("mde_uid_created", String(Date.now()));
      }
      return id;
    } catch (_) {
      return "mde_u_" + reqId();
    }
  }

  function getDaysSinceFirstVisit() {
    try {
      var created = localStorage.getItem("mde_uid_created");
      if (!created) return 0;
      return Math.floor((Date.now() - parseInt(created, 10)) / 86400000);
    } catch (_) {
      return 0;
    }
  }

  function getTotalPageViews() {
    try {
      return parseInt(localStorage.getItem("mde_total_pv") || "0", 10) || 0;
    } catch (_) {
      return 0;
    }
  }

  function bumpTotalPageViews() {
    try {
      var n = getTotalPageViews() + 1;
      localStorage.setItem("mde_total_pv", String(n));
    } catch (_) {}
  }

  function getTotalSessions() {
    try {
      return parseInt(localStorage.getItem("mde_total_sessions") || "0", 10) || 0;
    } catch (_) {
      return 0;
    }
  }

  function getConsentString() {
    return new Promise(function (resolve) {
      if (typeof w.__tcfapi === "function") {
        try {
          w.__tcfapi("getTCData", 2, function (data, success) {
            resolve(success && data && data.tcString ? data.tcString : null);
          });
        } catch (_) {
          resolve(null);
        }
      } else resolve(null);
    });
  }

  function getUspString() {
    return new Promise(function (resolve) {
      if (typeof w.__uspapi === "function") {
        try {
          w.__uspapi("getUSPData", 1, function (d, ok) {
            resolve(ok && d && d.uspString ? d.uspString : null);
          });
        } catch (_) {
          resolve(null);
        }
      } else resolve(null);
    });
  }

  function getGppString() {
    return new Promise(function (resolve) {
      try {
        if (w.__gpp && typeof w.__gpp === "function") {
          var s = w.__gpp("getGPPData");
          resolve(s && s.gppString ? s.gppString : null);
        } else resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  function hasBasicConsent() {
    try {
      return !!(
        d.cookieEnabled ||
        localStorage.getItem("mde_uid")
      );
    } catch (_) {
      return false;
    }
  }

  function collectDeviceSignals() {
    var nav = w.navigator || {};
    var sc = w.screen || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    return {
      screenWidth: sc.width,
      screenHeight: sc.height,
      devicePixelRatio: w.devicePixelRatio || 1,
      colorDepth: sc.colorDepth,
      orientation:
        sc.orientation && sc.orientation.type
          ? sc.orientation.type
          : w.innerWidth > w.innerHeight
            ? "landscape"
            : "portrait",
      userAgent: nav.userAgent || "",
      language: nav.language || "",
      languages: nav.languages ? nav.languages.join(",") : "",
      platform: nav.platform || "",
      cookieEnabled: !!nav.cookieEnabled,
      doNotTrack: nav.doNotTrack,
      hardwareConcurrency: nav.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
      maxTouchPoints: nav.maxTouchPoints,
      connectionType: conn && conn.effectiveType,
      connectionDownlink: conn && conn.downlink,
      connectionRtt: conn && conn.rtt,
      connectionSaveData: conn && conn.saveData,
      isMobile: /Mobi|Android/i.test(nav.userAgent || ""),
      isTablet: /Tablet|iPad/i.test(nav.userAgent || ""),
      isCTV: /TV|SmartTV|HbbTV|SMART-TV|CrKey|googletv/i.test(nav.userAgent || ""),
      isBot: /bot|crawler|spider|headless/i.test((nav.userAgent || "").toLowerCase())
    };
  }

  function collectPageSignals() {
    var nav = w.performance && w.performance.timing;
    var loadTime = null;
    var domContentLoaded = null;
    if (nav && nav.loadEventEnd && nav.navigationStart) {
      loadTime = nav.loadEventEnd - nav.navigationStart;
    }
    if (nav && nav.domContentLoadedEventEnd && nav.navigationStart) {
      domContentLoaded = nav.domContentLoadedEventEnd - nav.navigationStart;
    }
    var isFirst = false;
    try {
      isFirst = sessionStorage.getItem("mde_page_count") === null;
    } catch (_) {}
    var depth = 0;
    try {
      /* incremented per auction in runSlot */
      depth = parseInt(sessionStorage.getItem("mde_page_count") || "0", 10) || 0;
    } catch (_) {}

    var kwMeta = d.querySelector('meta[name="keywords"]');
    var descMeta = d.querySelector('meta[name="description"]');
    var canonical = d.querySelector('link[rel="canonical"]');
    return {
      url: w.location.href,
      domain: w.location.hostname,
      path: w.location.pathname,
      referrer: d.referrer || "",
      title: d.title || "",
      charset: d.characterSet || "",
      canonicalUrl: canonical && canonical.href ? canonical.href : null,
      keywords: kwMeta && kwMeta.content ? kwMeta.content : null,
      description: descMeta && descMeta.content ? descMeta.content : null,
      ogType: metaContent('meta[property="og:type"]'),
      ogSite: metaContent('meta[property="og:site_name"]'),
      articleSection: metaContent('meta[property="article:section"]'),
      articleTags: metaContent('meta[property="article:tag"]'),
      loadTime: loadTime,
      domContentLoaded: domContentLoaded,
      timeOnPage: engagement.timeVisible,
      isFirstPage: isFirst,
      pageDepth: depth,
      documentHidden: d.hidden,
      visibilityState: d.visibilityState,
      hasFocus: typeof d.hasFocus === "function" ? d.hasFocus() : null
    };
  }

  function metaContent(sel) {
    var el = d.querySelector(sel);
    return el && el.content ? el.content : null;
  }

  function collectGeoSignals() {
    try {
      var fmt = Intl.DateTimeFormat();
      return {
        timezone: fmt.resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        locale: fmt.resolvedOptions().locale || ""
      };
    } catch (_) {
      return {
        timezone: null,
        timezoneOffset: new Date().getTimezoneOffset(),
        locale: ""
      };
    }
  }

  function measureViewability(slotDiv, timeoutMs) {
    return new Promise(function (resolve) {
      if (!slotDiv || !w.IntersectionObserver) {
        resolve(null);
        return;
      }
      var done = false;
      var to = w.setTimeout(function () {
        if (!done) {
          done = true;
          resolve(null);
        }
      }, timeoutMs || 180);
      var observer = new w.IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          if (!entry || done) return;
          done = true;
          w.clearTimeout(to);
          var sh = d.documentElement.scrollHeight - w.innerHeight;
          var scrollPct = sh <= 0 ? 0 : Math.round((w.scrollY / sh) * 100);
          resolve({
            inViewport: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            boundingRect: {
              top: entry.boundingClientRect.top,
              left: entry.boundingClientRect.left,
              width: entry.boundingClientRect.width,
              height: entry.boundingClientRect.height
            },
            viewportWidth: w.innerWidth,
            viewportHeight: w.innerHeight,
            slotPositionFromTop: entry.boundingClientRect.top + w.scrollY,
            above_fold: entry.boundingClientRect.top < w.innerHeight,
            scroll_depth_percent: scrollPct
          });
          observer.disconnect();
        },
        { threshold: [0, 0.5, 1] }
      );
      observer.observe(slotDiv);
    });
  }

  function collectAllSignals(slotDiv) {
    bindEngagementOnce();
    return Promise.all([
      getConsentString(),
      getUspString(),
      getGppString(),
      measureViewability(slotDiv, 180)
    ]).then(function (parts) {
      var tcfConsent = parts[0];
      var uspString = parts[1];
      var gppString = parts[2];
      var viewability = parts[3];

      var isNewSession = false;
      try {
        isNewSession = sessionStorage.getItem("mde_session_start") === null;
      } catch (_) {
        isNewSession = true;
      }

      var sessionId = getOrCreateSessionId();
      var userId = getOrCreateUserId();
      var sessionStart = null;
      try {
        sessionStart = sessionStorage.getItem("mde_session_start");
      } catch (_) {}
      var sessCount = 0;
      try {
        sessCount = parseInt(sessionStorage.getItem("mde_page_count") || "0", 10) || 0;
      } catch (_) {}

      var sessionSignals = {
        sessionId: sessionId,
        userId: userId,
        sessionStart: sessionStart || String(Date.now()),
        sessionPageCount: sessCount + 1,
        isNewSession: isNewSession,
        daysSinceFirstVisit: getDaysSinceFirstVisit(),
        totalPageViews: getTotalPageViews(),
        totalSessions: getTotalSessions(),
        tcfConsent: tcfConsent,
        uspString: uspString,
        gppString: gppString,
        consentGiven: hasBasicConsent()
      };

      return {
        device: collectDeviceSignals(),
        page: collectPageSignals(),
        session: sessionSignals,
        engagement: {
          mouseActivity: engagement.mouseActivity,
          touchActivity: engagement.touchActivity,
          keyboardActivity: engagement.keyboardActivity,
          scrollDepth: engagement.scrollDepth,
          timeVisible: engagement.timeVisible,
          idleTime: engagement.idleTime
        },
        geo: collectGeoSignals(),
        viewability: viewability,
        collectedAt: Date.now()
      };
    });
  }

  function getFreqCap(campaignId) {
    try {
      var key = "mde_freq_" + campaignId;
      var stored = localStorage.getItem(key);
      if (!stored) return { count: 0, dayStart: Date.now() };
      var data = JSON.parse(stored);
      var now = new Date();
      var storedDate = new Date(data.dayStart);
      if (now.toDateString() !== storedDate.toDateString()) {
        return { count: 0, dayStart: Date.now() };
      }
      return data;
    } catch (_) {
      return { count: 0, dayStart: Date.now() };
    }
  }

  function incrementFreqCap(campaignId) {
    try {
      var key = "mde_freq_" + campaignId;
      var cap = getFreqCap(campaignId);
      cap.count++;
      cap.dayStart = cap.dayStart || Date.now();
      localStorage.setItem(key, JSON.stringify(cap));
    } catch (_) {}
  }

  function incrementSessionFreqCap(campaignId) {
    try {
      var key = "mde_freqsess_" + campaignId;
      var n = parseInt(sessionStorage.getItem(key) || "0", 10) || 0;
      sessionStorage.setItem(key, String(n + 1));
    } catch (_) {}
  }

  function buildFreqExt() {
    var day = {};
    var sess = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf("mde_freq_") !== 0) continue;
        if (k.indexOf("mde_freqsess_") === 0) continue;
        var cid = k.slice("mde_freq_".length);
        if (!cid) continue;
        var fd = getFreqCap(cid);
        day[cid] = fd.count;
      }
    } catch (_) {}
    try {
      for (var j = 0; j < sessionStorage.length; j++) {
        var sk = sessionStorage.key(j);
        if (!sk || sk.indexOf("mde_freqsess_") !== 0) continue;
        var cid2 = sk.slice("mde_freqsess_".length);
        if (!cid2) continue;
        var sn = parseInt(sessionStorage.getItem(sk) || "0", 10) || 0;
        sess[cid2] = sn;
      }
    } catch (_) {}
    return { freq_caps: day, freq_caps_session: sess };
  }

  function reqId() {
    return (
      (w.crypto && w.crypto.randomUUID && w.crypto.randomUUID()) ||
      "r_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
    );
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

  function auctionUrl() {
    return cfg.auctionUrl || DEFAULT_AUCTION;
  }

  function exchangeApiBase() {
    try {
      var u = new URL(auctionUrl());
      return u.origin;
    } catch (_) {
      return "https://exchange.adsgupta.com";
    }
  }

  // Remote config fetch — runs on every page load, 500ms max
  async function loadRemoteConfig(publisherId) {
    try {
      var controller = new AbortController();
      var timeout = setTimeout(function () {
        controller.abort();
      }, 500);
      var res = await fetch(exchangeApiBase() + "/api/publisher-config/" + publisherId, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null; // never block auction if config fails
    }
  }

  function fireSignalEvent(type, auctionId, sig) {
    if (!auctionId || !sig) return;
    var payload = {
      event_type: type,
      auction_id: auctionId,
      user_id: sig.session && sig.session.userId,
      session_id: sig.session && sig.session.sessionId,
      url: sig.page && sig.page.url,
      scroll_depth: sig.engagement && sig.engagement.scrollDepth,
      time_on_page_ms: sig.page && sig.page.timeOnPage
    };
    var url = exchangeApiBase() + "/api/signals";
    var json = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([json], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: "POST",
          body: json,
          keepalive: true,
          headers: { "Content-Type": "application/json" }
        }).catch(function () {});
      }
    } catch (_) {}
  }

  function trackBase() {
    return cfg.trackBase || TRACK_BASE;
  }

  function fetchAuction(body) {
    return new Promise(function (resolve, reject) {
      var ctrl = new AbortController();
      var to = w.setTimeout(function () {
        ctrl.abort();
      }, 3000);

      fetch(auctionUrl(), {
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
      fireSignalEvent("impression_rendered", bid.id, slot._lastSignals);
    };
    el.appendChild(f);

    if (bid.cid) {
      incrementFreqCap(bid.cid);
      incrementSessionFreqCap(bid.cid);
    }

    var tb = trackBase();
    if (bid.id) {
      new Image().src = tb + "/impression?id=" + encodeURIComponent(bid.id);
    }
    if (bid.nurl) {
      try {
        var nu = bid.nurl.replace(/\$\{AUCTION_PRICE\}/g, String(price));
        fetch(nu, { method: "GET", mode: "no-cors" }).catch(function () {});
      } catch (_) {}
    }
  }

  function buildBidRequest(slot, unitId, signals) {
    var rid = reqId();
    var fx = buildFreqExt();
    var impExt = {
      screenWidth: signals.device.screenWidth,
      screenHeight: signals.device.screenHeight,
      devicePixelRatio: signals.device.devicePixelRatio,
      hardwareConcurrency: signals.device.hardwareConcurrency,
      connectionType: signals.device.connectionType,
      url: signals.page.url,
      referrer: signals.page.referrer,
      title: signals.page.title,
      keywords: signals.page.keywords,
      articleTags: signals.page.articleTags,
      articleSection: signals.page.articleSection,
      sessionId: signals.session.sessionId,
      userId: signals.session.userId,
      sessionPageCount: signals.session.sessionPageCount,
      daysSinceFirstVisit: signals.session.daysSinceFirstVisit,
      isNewSession: signals.session.isNewSession,
      totalPageViews: signals.session.totalPageViews,
      scrollDepth: signals.engagement.scrollDepth,
      timeOnPage: signals.page.timeOnPage,
      timeOnPageMs: signals.page.timeOnPage,
      above_fold: signals.viewability && signals.viewability.above_fold,
      timezone: signals.geo.timezone,
      locale: signals.geo.locale,
      consentGiven: signals.session.consentGiven,
      tcfConsent: signals.session.tcfConsent,
      uspString: signals.session.uspString,
      gppString: signals.session.gppString,
      mde_signals: signals
    };
    var net = cfg.networkCode || "";
    var req = {
      id: rid,
      imp: [
        {
          id: reqId(),
          tagid: unitId,
          bidfloor: slot.floor != null ? slot.floor : 0.5,
          banner: { format: parseSizes(slot.sizes) },
          secure: w.location.protocol === "https:" ? 1 : 0,
          ext: impExt
        }
      ],
      site: {
        page: w.location.href,
        domain: w.location.hostname,
        publisher: net ? { id: net } : undefined
      },
      user: {
        id: signals.session.userId,
        consent: signals.session.tcfConsent || undefined,
        ext: {
          freq_caps: fx.freq_caps,
          freq_caps_session: fx.freq_caps_session,
          sessionId: signals.session.sessionId,
          sessionPageCount: signals.session.sessionPageCount,
          daysSinceFirstVisit: signals.session.daysSinceFirstVisit,
          isNewSession: signals.session.isNewSession,
          totalPageViews: signals.session.totalPageViews,
          scrollDepth: signals.engagement.scrollDepth,
          timeOnPage: signals.page.timeOnPage,
          timeOnPageMs: signals.page.timeOnPage,
          above_fold: signals.viewability && signals.viewability.above_fold,
          timezone: signals.geo.timezone,
          locale: signals.geo.locale,
          consentGiven: signals.session.consentGiven,
          tcfConsent: signals.session.tcfConsent,
          uspString: signals.session.uspString,
          gppString: signals.session.gppString
        }
      },
      device: { ua: navigator.userAgent, w: screen.width, h: screen.height },
      at: 1,
      tmax: 3000,
      source: {
        tid: rid,
        pchain: "mde-exchange-001!" + net,
        schain: {
          complete: 1,
          ver: "1.0",
          nodes: [
            {
              asi: "exchange.adsgupta.com",
              sid: net,
              rid: rid,
              hp: 1,
              name: "MDE Exchange",
              domain: "exchange.adsgupta.com"
            }
          ]
        }
      },
      regs: {}
    };
    if (signals.session.uspString) {
      req.regs.us_privacy = signals.session.uspString;
    }
    return req;
  }

  function runSlot(divId, slot) {
    inFlight.delete(divId);
    if (displayed.has(divId)) return;
    displayed.add(divId);

    if (w.location.protocol === "http:") {
      console.warn("[mde] Non-HTTPS page; some features may be limited.");
    }

    try {
      var pc = parseInt(sessionStorage.getItem("mde_page_count") || "0", 10) || 0;
      sessionStorage.setItem("mde_page_count", String(pc + 1));
      if (pc === 0) {
        var ts = parseInt(localStorage.getItem("mde_total_sessions") || "0", 10) || 0;
        localStorage.setItem("mde_total_sessions", String(ts + 1));
      }
    } catch (_) {}

    bumpTotalPageViews();

    var unitId = slot.unitId;
    var el = d.getElementById(divId);

    collectAllSignals(el)
      .then(function (signals) {
        slot._lastSignals = signals;
        var body = buildBidRequest(slot, unitId, signals);
        fetchAuctionWithRetry(body)
          .then(function (res) {
            if (!res || !res.seatbid || !res.seatbid[0]) return;
            var sb = res.seatbid[0];
            if (!sb.bid || !sb.bid[0]) return;
            var bid = sb.bid[0];
            renderAd(divId, slot, bid, unitId);
          })
          .catch(function () {});
      })
      .catch(function () {
        collectAllSignals(null).then(function (signals) {
          slot._lastSignals = signals;
          var body = buildBidRequest(slot, unitId, signals);
          fetchAuctionWithRetry(body)
            .then(function (res) {
              if (!res || !res.seatbid || !res.seatbid[0]) return;
              var sb = res.seatbid[0];
              if (!sb.bid || !sb.bid[0]) return;
              renderAd(divId, slot, sb.bid[0], unitId);
            })
            .catch(function () {});
        });
      });
  }

  mde.init = function (c) {
    try {
      var pubId = c && c.networkCode ? c.networkCode : null;
      if (pubId) {
        loadRemoteConfig(pubId).then(function (remoteConfig) {
          if (!remoteConfig) return;
          w._mde_remote_config = remoteConfig;
          if (remoteConfig.adUnits && remoteConfig.adUnits.forEach) {
            w._mde_unit_floors = {};
            remoteConfig.adUnits.forEach(function (u) {
              if (u && u.id) w._mde_unit_floors[u.id] = u.floor;
            });
            // Apply floors to any already-defined slots.
            try {
              for (var i = 0; i < slots.length; i++) {
                var s = slots[i];
                var f = w._mde_unit_floors && s && s.unitId ? w._mde_unit_floors[s.unitId] : null;
                if (f != null) s.floor = f;
              }
            } catch (_) {}
          }
        });
      }
    } catch (_) {}

    cfg = c || {};
    if (typeof cfg.auctionUrl === "string" && cfg.auctionUrl) {
      /* ok */
    } else if (cfg.auctionEndpoint) {
      cfg.auctionUrl = cfg.auctionEndpoint;
    } else {
      cfg.auctionUrl = DEFAULT_AUCTION;
    }
    if (typeof cfg.trackBase === "string" && cfg.trackBase) {
      /* ok */
    } else {
      cfg.trackBase = TRACK_BASE;
    }
  };
  mde.defineSlot = function (s) {
    try {
      var f = w._mde_unit_floors && s && s.unitId ? w._mde_unit_floors[s.unitId] : null;
      if (f != null) s.floor = f;
    } catch (_) {}
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
