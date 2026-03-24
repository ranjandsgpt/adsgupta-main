(function (w) {
  var slots = [];
  var config = {};

  function origin() {
    return (config && config.origin) || "https://exchange.adsgupta.com";
  }

  function ensureIframe(divId, html) {
    var el = document.getElementById(divId);
    if (!el) return;
    var iframe = document.createElement("iframe");
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.setAttribute("scrolling", "no");
    el.innerHTML = "";
    el.appendChild(iframe);
    var doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  }

  var mde = (w.mde = w.mde || {});
  mde.cmd = mde.cmd || [];

  mde.init = function (opts) {
    config = opts || {};
  };

  mde.defineSlot = function (slot) {
    slots.push(slot);
  };

  mde.enableServices = function () {};

  mde.display = async function (divId) {
    var slot = slots.find(function (s) {
      return s.div === divId;
    });
    if (!slot) return;
    var req = {
      id: "auc-" + Math.random().toString(36).slice(2),
      imp: [
        {
          id: "1",
          tagid: slot.adUnitId || slot.tagid || slot.unitPath,
          banner: {
            format: (slot.sizes || []).map(function (x) {
              var p = String(x).split("x");
              return { w: Number(p[0]), h: Number(p[1]) };
            })
          },
          bidfloor: slot.floor || 0
        }
      ],
      site: { domain: location.hostname, page: location.href },
      device: { ua: navigator.userAgent }
    };

    var base = origin().replace(/\/$/, "");
    var res = await fetch(base + "/api/openrtb/auction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });
    if (!res.ok) return;
    var json = await res.json();
    var bid = json.seatbid && json.seatbid[0] && json.seatbid[0].bid && json.seatbid[0].bid[0];
    if (!bid) return;
    ensureIframe(divId, bid.adm);
    new Image().src = base + "/api/track/impression?auctionId=" + encodeURIComponent(req.id);
    if (bid.nurl) fetch(bid.nurl).catch(function () {});
  };

  if (mde.cmd.length) {
    mde.cmd.forEach(function (fn) {
      if (typeof fn === "function") fn();
    });
    mde.cmd = [];
  }
})(window);
