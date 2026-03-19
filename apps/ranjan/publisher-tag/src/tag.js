// Lightweight publisher-side tag for the adsgupta exchange.
// Finds ad slots, batches them into a single /ad-request call, and renders creatives.

(function () {
  var EXCHANGE_URL = 'https://ranjan.adsgupta.com';

  function parseSizes(s) {
    if (!s) return [];
    return String(s)
      .split(',')
      .map(function (pair) {
        var parts = pair.trim().split('x');
        var w = parseInt(parts[0], 10);
        var h = parseInt(parts[1], 10);
        if (!w || !h) return null;
        return w + 'x' + h;
      })
      .filter(Boolean);
  }

  function findSlots() {
    var nodes = document.querySelectorAll('[data-adsgupta-sizes]');
    var slots = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.id || 'adsgupta-slot-' + (i + 1);
      el.id = id;
      var sizes = parseSizes(el.getAttribute('data-adsgupta-sizes'));
      var floor = parseFloat(el.getAttribute('data-adsgupta-floor') || '0');
      var pub = el.getAttribute('data-adsgupta-publisher') || 'demo_pub';
      slots.push({
        id: id,
        el: el,
        sizes: sizes,
        floor: isNaN(floor) ? 0 : floor,
        publisher: pub,
      });
    }
    return slots;
  }

  function buildRequest(slots) {
    if (!slots.length) return null;
    var firstPub = slots[0].publisher;
    var slotPayload = slots.map(function (s) {
      return {
        id: s.id,
        sizes: s.sizes,
        floor: s.floor,
      };
    });

    var params = [];
    params.push('slots=' + encodeURIComponent(JSON.stringify(slotPayload)));
    params.push('pub=' + encodeURIComponent(firstPub));
    params.push('page=' + encodeURIComponent(location.href));
    if (document.referrer) {
      params.push('ref=' + encodeURIComponent(document.referrer));
    }
    params.push('sw=' + (window.innerWidth || 0));
    params.push('sh=' + (window.innerHeight || 0));
    params.push('lang=' + encodeURIComponent(navigator.language || ''));
    params.push('dnt=' + (navigator.doNotTrack === '1' ? '1' : '0'));

    return EXCHANGE_URL + '/ad-request?' + params.join('&');
  }

  function firePixel(url) {
    if (!url) return;
    var img = new Image();
    img.src = url;
  }

  function renderSlots(slots, response) {
    if (!response || !response.slots) return;
    var byId = {};
    for (var i = 0; i < response.slots.length; i++) {
      byId[response.slots[i].slotId] = response.slots[i];
    }
    for (var j = 0; j < slots.length; j++) {
      var s = slots[j];
      var r = byId[s.id];
      if (!r || !r.filled) continue;
      s.el.innerHTML = r.creative || '';
      firePixel(r.impressionBeacon);
      (function (viewUrl, el) {
        if (!('IntersectionObserver' in window) || !viewUrl) return;
        var seen = false;
        var obs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (seen) return;
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                seen = true;
                firePixel(viewUrl);
                obs.disconnect();
              }
            });
          },
          { root: null, rootMargin: '0px', threshold: [0.5] },
        );
        obs.observe(el);
      })(r.viewabilityBeacon, s.el);
    }
  }

  function requestAds(slots) {
    var url = buildRequest(slots);
    if (!url) return;
    var timeout = 2000;
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
    }, timeout);

    fetch(url, { credentials: 'omit' })
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        renderSlots(slots, json);
      })
      .catch(function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
      });
  }

  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function () {
    var slots = findSlots();
    if (!('IntersectionObserver' in window)) {
      requestAds(slots);
      return;
    }

    var inView = [];
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            inView.push(entry.target);
          }
        });
      },
      { root: null, rootMargin: '200px', threshold: [0] },
    );

    for (var i = 0; i < slots.length; i++) {
      observer.observe(slots[i].el);
    }

    setTimeout(function () {
      observer.disconnect();
      var toRequest = slots.filter(function (s) {
        return inView.indexOf(s.el) !== -1;
      });
      if (!toRequest.length) toRequest = slots;
      requestAds(toRequest);
    }, 200);
  });
})();

