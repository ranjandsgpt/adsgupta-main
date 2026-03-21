(function() {
  var head = document.head;
  var url = window.location.href;
  var title = document.title;
  var desc = (document.querySelector('meta[name="description"]') || {}).content || '';

  // Canonical if missing
  if (!document.querySelector('link[rel="canonical"]')) {
    var c = document.createElement('link');
    c.rel = 'canonical'; c.href = url;
    head.appendChild(c);
  }

  // hreflang tags
  var langs = [
    {lang: 'en', href: url},
    {lang: 'en-us', href: url},
    {lang: 'en-in', href: url},
    {lang: 'en-gb', href: url},
    {lang: 'en-au', href: url},
    {lang: 'x-default', href: url}
  ];
  langs.forEach(function(l) {
    if (!document.querySelector('link[hreflang="' + l.lang + '"]')) {
      var el = document.createElement('link');
      el.rel = 'alternate'; el.hreflang = l.lang; el.href = l.href;
      head.appendChild(el);
    }
  });

  // Twitter creator if missing
  if (!document.querySelector('meta[name="twitter:creator"]')) {
    var tw = document.createElement('meta');
    tw.name = 'twitter:creator'; tw.content = '@adsgupta';
    head.appendChild(tw);
  }

  // Twitter site if missing
  if (!document.querySelector('meta[name="twitter:site"]')) {
    var tws = document.createElement('meta');
    tws.name = 'twitter:site'; tws.content = '@adsgupta';
    head.appendChild(tws);
  }

  // OG locale if missing
  if (!document.querySelector('meta[property="og:locale"]')) {
    var ogl = document.createElement('meta');
    ogl.setAttribute('property', 'og:locale'); ogl.content = 'en_US';
    head.appendChild(ogl);
  }

  // Article author for blog pages
  if (url.indexOf('/blog/') > -1) {
    if (!document.querySelector('meta[property="article:author"]')) {
      var aa = document.createElement('meta');
      aa.setAttribute('property', 'article:author'); aa.content = 'Ranjan Dasgupta';
      head.appendChild(aa);
    }
    if (!document.querySelector('meta[property="article:publisher"]')) {
      var ap = document.createElement('meta');
      ap.setAttribute('property', 'article:publisher'); ap.content = 'https://adsgupta.com';
      head.appendChild(ap);
    }
  }

  // BreadcrumbList schema
  var path = window.location.pathname;
  var parts = path.split('/').filter(Boolean);
  if (parts.length > 0) {
    var items = [{name: 'Home', url: 'https://ranjan.adsgupta.com'}];
    var built = 'https://ranjan.adsgupta.com';
    parts.forEach(function(p) {
      built += '/' + p;
      items.push({name: p.replace(/-/g, ' ').replace(/\w/g, function(c){return c.toUpperCase();}), url: built});
    });
    var bc = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map(function(item, i) {
        return {'@type': 'ListItem', 'position': i+1, 'name': item.name, 'item': item.url};
      })
    };
    var bcs = document.createElement('script');
    bcs.type = 'application/ld+json';
    bcs.textContent = JSON.stringify(bc);
    head.appendChild(bcs);
  }
})();
