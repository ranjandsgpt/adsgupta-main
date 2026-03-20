(function () {
  // Minimal SEO injector used by blog pages.
  // It only adds tags if they're missing to avoid overriding pre-built SEO.
  function ensureCanonical() {
    var canonical = document.querySelector("link[rel='canonical']");
    if (canonical && canonical.getAttribute("href")) return;

    var url = "";
    try {
      url = window.location.href.split("#")[0];
    } catch (e) {}

    if (!url) return;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  function ensureOpenGraphAndTwitter() {
    // Ensure basic defaults when missing.
    // We intentionally don't force values if tags already exist.
    var ogTitle = getMeta("property", "og:title");
    var ogDesc = getMeta("property", "og:description");
    var ogUrl = getMeta("property", "og:url");
    var ogImage = getMeta("property", "og:image");

    if (!ogUrl) {
      var url = "";
      try {
        url = window.location.href.split("#")[0];
      } catch (e) {}
      if (url) {
        ogUrl = createMeta("property", "og:url", url);
      }
    }

    if (!ogTitle) {
      var t = document.title || "";
      if (t) createMeta("property", "og:title", t);
    }

    if (!ogDesc) {
      var d = getMeta("name", "description");
      if (d && d.getAttribute("content")) {
        createMeta("property", "og:description", d.getAttribute("content"));
      }
    }

    // If the page already sets twitter card / title / desc / image, don't override.
    if (!getMeta("name", "twitter:card")) createMeta("name", "twitter:card", "summary_large_image");
    if (!getMeta("name", "twitter:title")) {
      var tt = document.title || "";
      if (tt) createMeta("name", "twitter:title", tt);
    }
    if (!getMeta("name", "twitter:description")) {
      var td = getMeta("name", "description");
      if (td && td.getAttribute("content")) createMeta("name", "twitter:description", td.getAttribute("content"));
    }
    if (!getMeta("name", "twitter:image")) {
      if (ogImage && ogImage.getAttribute("content")) {
        createMeta("name", "twitter:image", ogImage.getAttribute("content"));
      }
    }
  }

  function ensurePersonJsonLd() {
    var id = "adsgupta-person-jsonld";
    if (document.getElementById(id)) return;

    var url = "";
    try {
      url = window.location.href.split("#")[0];
    } catch (e) {}

    var person = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Ranjan Dasgupta",
      "url": "https://ranjan.adsgupta.com",
      "jobTitle": "AdTech Product Leader",
      "sameAs": ["https://www.linkedin.com/in/ranjandsgpt/", "https://adsgupta.com"]
    };

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(person);

    // Append to head if possible; fallback to documentElement.
    (document.head || document.documentElement).appendChild(script);
  }

  function getMeta(attr, name) {
    return document.querySelector('meta[' + attr + '="' + name + '"]');
  }

  function createMeta(attr, name, content) {
    if (!content) return null;
    var m = document.createElement("meta");
    m.setAttribute(attr, name);
    m.setAttribute("content", String(content));
    document.head.appendChild(m);
    return m;
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      ensureCanonical();
      ensureOpenGraphAndTwitter();
      ensurePersonJsonLd();
    } catch (e) {}
  });
  if (document.readyState !== "loading") {
    // If script loads late, still run immediately.
    try {
      ensureCanonical();
      ensureOpenGraphAndTwitter();
      ensurePersonJsonLd();
    } catch (e) {}
  }
})();

