/**
 * Hydrates <article class="prose" data-cms-slug="..."> from blog.adsgupta.com CMS.
 * Static HTML remains in the document if fetch fails or returns 404.
 */
(function () {
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderContent(c) {
    if (!c) return "";
    var t = String(c).trim();
    if (/<[a-z][\s\S]*>/i.test(t)) return t;
    return t
      .split(/\n\n+/)
      .map(function (p) {
        return "<p>" + escapeHtml(p.trim()).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  var base = window.__CMS_API_BASE__ || "https://blog.adsgupta.com/api/posts";
  var el = document.querySelector("article.prose[data-cms-slug]");
  if (!el) return;

  var slug = el.getAttribute("data-cms-slug");
  if (!slug) return;

  var url = base + "?slug=" + encodeURIComponent(slug) + "&subdomain=ranjan";

  fetch(url, { credentials: "omit", mode: "cors" })
    .then(function (r) {
      if (!r.ok) return null;
      return r.json();
    })
    .then(function (data) {
      if (!data || !data.post || data.post.content == null) return;
      el.innerHTML = renderContent(data.post.content);
    })
    .catch(function () {});
})();
