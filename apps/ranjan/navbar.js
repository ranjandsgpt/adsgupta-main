(function () {
  var NAV_HTML = `
    <header id="adsg-navbar" role="banner" class="adsg-nav">
      <nav aria-label="Main navigation" class="adsg-nav__inner">
        <a href="/" class="adsg-nav__brand" aria-label="Ranjan Dasgupta Home">
          <div class="adsg-nav__avatar" aria-hidden="true">RD</div>
          <span class="adsg-nav__name">Ranjan Dasgupta</span>
        </a>
        <ul class="adsg-nav__links" role="menubar">
          <li role="none"><a href="/" role="menuitem" class="adsg-nav__link">Home</a></li>
          <li role="none"><a href="/about" role="menuitem" class="adsg-nav__link">About</a></li>
          <li role="none"><a href="/work" role="menuitem" class="adsg-nav__link">Work</a></li>
          <li role="none"><a href="/insights" role="menuitem" class="adsg-nav__link">Insights</a></li>
          <li role="none"><a href="/contact" role="menuitem" class="adsg-nav__link">Contact</a></li>
          <li role="none"><a href="/audit" role="menuitem" class="adsg-nav__link adsg-nav__link--audit">Audit Tool</a></li>
          <li role="none"><a href="https://adsgupta.com" role="menuitem" class="adsg-nav__link adsg-nav__link--adsgupta" target="_blank" rel="noopener">AdsGupta →</a></li>
          <li role="none">
            <button type="button" id="adsg-theme-toggle" class="adsg-nav__theme-btn" aria-label="Toggle theme">
              <svg id="adsg-icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg id="adsg-icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
            </button>
          </li>
        </ul>
        <div class="adsg-nav__mobile-right">
          <button type="button" id="adsg-theme-toggle-mobile" class="adsg-nav__theme-btn" aria-label="Toggle theme">
            <svg id="adsg-icon-sun-m" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            <svg id="adsg-icon-moon-m" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
          </button>
          <button type="button" id="adsg-menu-btn" class="adsg-nav__menu-btn" aria-label="Open menu" aria-expanded="false">
            <svg id="adsg-icon-menu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <svg id="adsg-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </nav>
      <div id="adsg-mobile-menu" class="adsg-nav__mobile-menu" aria-hidden="true">
        <ul role="menu">
          <li><a href="/" role="menuitem" class="adsg-nav__mobile-link">Home</a></li>
          <li><a href="/about" role="menuitem" class="adsg-nav__mobile-link">About</a></li>
          <li><a href="/work" role="menuitem" class="adsg-nav__mobile-link">Work</a></li>
          <li><a href="/insights" role="menuitem" class="adsg-nav__mobile-link">Insights</a></li>
          <li><a href="/contact" role="menuitem" class="adsg-nav__mobile-link">Contact</a></li>
          <li><a href="/audit" role="menuitem" class="adsg-nav__mobile-link">Audit Tool</a></li>
          <li><a href="https://adsgupta.com" role="menuitem" class="adsg-nav__mobile-link" target="_blank" rel="noopener">AdsGupta →</a></li>
        </ul>
      </div>
    </header>
  `;

  var CSS = `
    #adsg-navbar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 50 !important;
      transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s !important;
      border-bottom: 1px solid transparent !important;
    }
    #adsg-navbar.scrolled {
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border-bottom-color: rgba(255,255,255,0.05) !important;
    }
    html[data-theme='dark'] #adsg-navbar.scrolled { background: rgba(10,10,10,0.8) !important; }
    html[data-theme='light'] #adsg-navbar.scrolled { background: rgba(255,255,255,0.8) !important; }

    .adsg-nav__inner {
      max-width: 1200px !important;
      margin: 0 auto !important;
      padding: 16px 48px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    @media (max-width: 768px) {
      .adsg-nav__inner { padding: 16px 24px !important; }
    }

    .adsg-nav__brand {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      text-decoration: none !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      transition: opacity 0.2s !important;
    }
    .adsg-nav__brand:hover { opacity: 0.8 !important; }
    html[data-theme='dark'] .adsg-nav__brand { color: #ffffff !important; }
    html[data-theme='light'] .adsg-nav__brand { color: #111827 !important; }

    .adsg-nav__avatar {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      background: #06b6d4 !important;
      color: #ffffff !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .adsg-nav__links {
      display: flex !important;
      align-items: center !important;
      gap: 32px !important;
      list-style: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    @media (max-width: 768px) { .adsg-nav__links { display: none !important; } }

    .adsg-nav__link {
      font-size: 14px !important;
      font-weight: 500 !important;
      text-decoration: none !important;
      transition: color 0.2s !important;
    }
    html[data-theme='dark'] .adsg-nav__link { color: #a1a1aa !important; }
    html[data-theme='light'] .adsg-nav__link { color: #6b7280 !important; }
    html[data-theme='dark'] .adsg-nav__link:hover { color: #ffffff !important; }
    html[data-theme='light'] .adsg-nav__link:hover { color: #111827 !important; }

    .adsg-nav__link--audit {
      background: #06b6d4 !important;
      color: #ffffff !important;
      padding: 6px 14px !important;
      border-radius: 9999px !important;
      font-size: 13px !important;
    }
    .adsg-nav__link--audit:hover { background: #22d3ee !important; color: #ffffff !important; }

    .adsg-nav__link--adsgupta { color: #06b6d4 !important; }
    .adsg-nav__link--adsgupta:hover { color: #22d3ee !important; text-decoration: underline !important; }

    .adsg-nav__theme-btn {
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      padding: 8px !important;
      border-radius: 9999px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: background 0.2s, color 0.2s !important;
    }
    html[data-theme='dark'] .adsg-nav__theme-btn { color: #a1a1aa !important; }
    html[data-theme='light'] .adsg-nav__theme-btn { color: #6b7280 !important; }
    .adsg-nav__theme-btn:hover { background: rgba(255,255,255,0.05) !important; color: #06b6d4 !important; }

    .adsg-nav__mobile-right {
      display: none !important;
      align-items: center !important;
      gap: 8px !important;
    }
    @media (max-width: 768px) { .adsg-nav__mobile-right { display: flex !important; } }

    .adsg-nav__menu-btn {
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      padding: 8px !important;
      border-radius: 8px !important;
      display: flex !important;
      align-items: center !important;
      transition: background 0.2s !important;
    }
    html[data-theme='dark'] .adsg-nav__menu-btn { color: #ffffff !important; }
    html[data-theme='light'] .adsg-nav__menu-btn { color: #111827 !important; }
    .adsg-nav__menu-btn:hover { background: rgba(255,255,255,0.05) !important; }

    .adsg-nav__mobile-menu {
      display: none !important;
      border-top: 1px solid rgba(255,255,255,0.05) !important;
      padding: 8px 24px 16px !important;
      transition: all 0.2s !important;
    }
    .adsg-nav__mobile-menu.open { display: block !important; }
    html[data-theme='dark'] .adsg-nav__mobile-menu { background: rgba(10,10,10,0.95) !important; }
    html[data-theme='light'] .adsg-nav__mobile-menu { background: rgba(255,255,255,0.95) !important; }

    .adsg-nav__mobile-menu ul { list-style: none !important; margin: 0 !important; padding: 0 !important; }
    .adsg-nav__mobile-link {
      display: block !important;
      padding: 12px 0 !important;
      font-size: 15px !important;
      font-weight: 500 !important;
      text-decoration: none !important;
      transition: color 0.2s !important;
    }
    html[data-theme='dark'] .adsg-nav__mobile-link { color: #ffffff !important; }
    html[data-theme='light'] .adsg-nav__mobile-link { color: #111827 !important; }

    /* Push page content down because navbar is fixed */
    body { padding-top: 64px !important; }
  `;

  function applyCSS() {
    if (!document.getElementById("adsg-navbar-style")) {
      var styleEl = document.createElement("style");
      styleEl.id = "adsg-navbar-style";
      styleEl.type = "text/css";
      styleEl.appendChild(document.createTextNode(CSS));
      document.head.appendChild(styleEl);
    }
  }

  function updateThemeIcons() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";

    var sun = document.getElementById("adsg-icon-sun");
    var moon = document.getElementById("adsg-icon-moon");
    if (sun) sun.style.display = isDark ? "none" : "block";
    if (moon) moon.style.display = isDark ? "block" : "none";

    var sunM = document.getElementById("adsg-icon-sun-m");
    var moonM = document.getElementById("adsg-icon-moon-m");
    if (sunM) sunM.style.display = isDark ? "none" : "block";
    if (moonM) moonM.style.display = isDark ? "block" : "none";
  }

  function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    updateThemeIcons();
  }

  function initMobileMenu() {
    var menuBtn = document.getElementById("adsg-menu-btn");
    var mobileMenu = document.getElementById("adsg-mobile-menu");
    var iconMenu = document.getElementById("adsg-icon-menu");
    var iconClose = document.getElementById("adsg-icon-close");

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));

      if (iconMenu) iconMenu.style.display = isOpen ? "none" : "block";
      if (iconClose) iconClose.style.display = isOpen ? "block" : "none";
    });
  }

  function ensureThemeFromStorage() {
    // Safety net if a page ever loads without the inline <head> theme bootstrap.
    var html = document.documentElement;
    var cur = html.getAttribute("data-theme");
    if (cur === "light" || cur === "dark") return;
    try {
      var t = localStorage.getItem("theme");
      if (t === "light" || t === "dark") {
        html.setAttribute("data-theme", t);
        return;
      }
    } catch (e) {}
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }

  function init() {
    ensureThemeFromStorage();
    applyCSS();

    // Replace the existing navbar.
    var oldNav = document.querySelector("nav.site-nav");
    if (oldNav && !document.getElementById("adsg-navbar")) {
      var container = document.createElement("div");
      container.innerHTML = NAV_HTML.trim();
      var newHeader = container.firstElementChild;
      if (newHeader) oldNav.replaceWith(newHeader);
    }

    // Attach scroll behavior.
    var updateScroll = function () {
      var nav = document.getElementById("adsg-navbar");
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    // Theme toggle buttons.
    var themeBtn = document.getElementById("adsg-theme-toggle");
    var themeBtnM = document.getElementById("adsg-theme-toggle-mobile");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    if (themeBtnM) themeBtnM.addEventListener("click", toggleTheme);

    // Mobile menu.
    initMobileMenu();

    // Initial icon state.
    updateThemeIcons();
  }

  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();
})();

