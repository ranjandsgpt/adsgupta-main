(function () {
  const FONT_CDN_URL =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap";

  const MASTER_FOOTER_HTML = `
    <footer class="adsg-footer" data-testid="footer-section" role="contentinfo">
      <div class="adsg-footer__container">
        <div class="adsg-footer__main">
          <div class="adsg-footer__left">
            <h3 class="adsg-footer__title">
              Stay Ahead of<br />the Curve
            </h3>

            <p class="adsg-footer__subtitle">
              Get exclusive insights on AI advertising, delivered to your inbox.
            </p>

            <form class="adsg-footer__form" data-testid="newsletter-form" aria-label="Newsletter signup">
              <input
                placeholder="Enter your email"
                data-testid="newsletter-input"
                class="adsg-footer__input"
                required
                type="email"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                data-testid="newsletter-submit"
                class="adsg-footer__submit"
                aria-label="Subscribe"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </form>

            <div
              class="adsg-footer__success"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Thanks! You are subscribed.
            </div>
          </div>

          <div class="adsg-footer__right" aria-label="Footer navigation">
            <div class="adsg-footer__grid">
              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Platform</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a
                      href="https://demoai.adsgupta.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="adsg-footer__link"
                    >
                      AI Sandbox
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/#features" class="adsg-footer__link">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>

              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Resources</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="/insights" class="adsg-footer__link">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">
                      API
                    </a>
                  </li>
                </ul>
              </div>

              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Company</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="/about" class="adsg-footer__link">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/contact" class="adsg-footer__link">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>

              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Legal</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="https://adsgupta.com/privacy" class="adsg-footer__link">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/terms" class="adsg-footer__link">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="adsg-footer__bottom">
          <div class="adsg-footer__brand">
            <a class="adsg-footer__brand-link" href="https://adsgupta.com" aria-label="ADS Gupta">
              ADS<span class="adsg-footer__brand-accent">GUPTA</span>
            </a>
            <span class="adsg-footer__copyright">© 2026 Ads Gupta. All rights reserved.</span>
          </div>

          <div class="adsg-footer__social" aria-label="Social links">
            <a
              href="https://twitter.com/adsgupta"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-twitter"
              class="adsg-footer__icon"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>

            <a
              href="https://linkedin.com/company/adsgupta"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-linkedin"
              class="adsg-footer__icon"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9" fill="none"></rect>
                <circle cx="4" cy="4" r="2" fill="none"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;

  const CSS_RAW = `
    /* Prevent apps/ranjan/theme.css from ever re-coloring the injected footer.
       theme.css targets footer[data-testid="footer-section"] with normal specificity,
       so we pin the same selectors here with !important. */
    footer[data-testid="footer-section"]{
      background:#0A0A0A !important;
      border-top:1px solid rgba(255,255,255,0.05) !important;
      padding:64px 0 !important;
      color:#e5e7eb !important;
      font-family:'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif !important;
      color-scheme: dark !important;
    }
    footer[data-testid="footer-section"] a{
      color:inherit !important;
      text-decoration:none !important;
    }
    footer[data-testid="footer-section"] a:hover{
      color:#ffffff !important;
    }
    footer[data-testid="footer-section"] h3,
    footer[data-testid="footer-section"] h4{
      color:#ffffff !important;
    }
    footer[data-testid="footer-section"] p{
      color:rgba(161,161,170,1) !important;
    }

    .adsg-footer{
      background:#0A0A0A;
      border-top:1px solid rgba(255,255,255,0.05);
      padding:64px 0;
      font-family:'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      color:#e5e7eb !important;
    }

    .adsg-footer, .adsg-footer *{
      font-family:'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .adsg-footer__container{
      max-width:1200px;
      margin:0 auto;
      padding:0 48px;
    }

    .adsg-footer__main{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:80px;
      margin-bottom:64px !important;
    }

    .adsg-footer__title{
      font-size:40px;
      font-weight:700;
      color:#ffffff !important;
      line-height:1.2;
      margin:0 0 16px 0;
      font-family:'Space Grotesk', sans-serif;
    }

    .adsg-footer__subtitle{
      color:#a1a1aa !important;
      font-size:18px;
      margin:0 0 32px 0 !important;
      max-width:400px;
    }

    .adsg-footer__form{
      display:flex;
      gap:12px;
      align-items:center;
    }

    .adsg-footer__input{
      flex:1;
      background:#18181b;
      border:1px solid rgba(255,255,255,0.08);
      border-radius:9999px;
      padding:16px 20px;
      color:#ffffff !important;
      font-size:15px;
      font-family:'Space Grotesk', sans-serif;
      outline:none;
    }

    .adsg-footer__input::placeholder{color:#71717a !important;}

    .adsg-footer__input:focus{
      border-color:rgba(6,182,212,0.5);
      box-shadow:none;
    }

    .adsg-footer__submit{
      width:56px;
      height:56px;
      min-width:56px;
      border-radius:50%;
      background:#06b6d4 !important;
      border:none;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-shrink:0;
    }

    .adsg-footer__submit:hover{background:#22d3ee !important;}

    .adsg-footer__success{
      color:#22d3ee !important;
      font-size:14px;
      margin-top:12px;
      display:none;
      line-height:1.4;
    }

    .adsg-footer__grid{
      display:grid;
      grid-template-columns:repeat(4, 1fr);
      gap:32px;
    }

    .adsg-footer__heading{
      color:#ffffff !important;
      font-size:14px !important;
      font-weight:600 !important;
      letter-spacing:0.025em !important;
      margin:0 0 16px 0 !important;
      font-family:'Space Grotesk', sans-serif;
      text-transform:none;
    }

    .adsg-footer__list{
      margin:0;
      padding:0;
      list-style:none;
    }

    .adsg-footer__link{
      color:#6f6f70 !important;
      font-size:14px !important;
      text-decoration:none !important;
      display:block !important;
      margin-bottom:12px !important;
      transition: color 0.3s !important;
      white-space:nowrap !important;
      font-family:'Space Grotesk', sans-serif;
    }

    .adsg-footer__list li:last-child .adsg-footer__link{margin-bottom:0;}

    .adsg-footer__link:hover{color:#ffffff !important;}

    .adsg-footer__bottom{
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding-top:32px;
      border-top:1px solid rgba(255,255,255,0.05) !important;
      flex-wrap:wrap;
      gap:24px;
    }

    .adsg-footer__brand{
      display:flex;
      align-items:center;
      flex-wrap:wrap;
    }

    .adsg-footer__brand-link{
      color:#ffffff !important;
      font-family:'Space Grotesk', sans-serif;
      font-size:24px;
      font-weight:700;
      text-decoration:none;
    }

    .adsg-footer__brand-accent{color:#22d3ee !important;}

    .adsg-footer__copyright{
      color:#52525b !important;
      font-size:14px;
      margin-left:24px;
    }

    .adsg-footer__social{
      display:flex;
      gap:16px;
      align-items:center;
    }

    .adsg-footer__icon{
      width:40px;
      height:40px;
      border-radius:50%;
      background:rgba(255,255,255,0.05);
      border:none;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#a1a1aa !important;
      text-decoration:none;
      transition:all 0.3s;
    }

    .adsg-footer__icon:hover{
      background:rgba(255,255,255,0.1);
      color:#ffffff !important;
    }

    /* Force SVG colors to track our pinned color, even if theme.css tweaks inherited values. */
    .adsg-footer__icon svg{
      fill:none !important;
      stroke:currentColor !important;
    }
    /* Newsletter submit arrow is currently a hard-coded dark stroke; pin it. */
    .adsg-footer__submit svg{
      fill:none !important;
      stroke:#000000 !important;
    }

    @media (max-width: 768px){
      .adsg-footer{padding:48px 0;}
      .adsg-footer__container{padding:0 24px;}

      .adsg-footer__main{
        grid-template-columns:1fr;
        gap:48px;
      }

      .adsg-footer__title{font-size:32px;}

      .adsg-footer__grid{
        grid-template-columns:repeat(2, 1fr);
        gap:24px;
      }

      .adsg-footer__bottom{
        flex-direction:column;
        align-items:center;
        gap:24px;
        text-align:center;
      }

      .adsg-footer__brand-link{font-size:22px;}

      .adsg-footer__copyright{
        margin-left:0;
        text-align:center;
      }

      .adsg-footer__social{
        justify-content:center;
      }
    }
  `;

  function applyImportantToFooterCSS(css) {
    // Add !important to the most commonly overridden properties so footer styling stays stable.
    // NOTE: This only modifies declarations, not selectors.
    return String(css).replace(
      /\b(color|font-weight|font-size|background|border|padding|margin)(-[a-z-]+)*\s*:\s*([^;]+);/gi,
      (match, prop, suffix, value) => {
        const fullProp = `${prop}${suffix || ""}`;
        const v = String(value).trim();
        if (/!important\s*$/i.test(v)) return match;
        return `${fullProp}: ${v} !important;`;
      }
    );
  }

  const CSS = applyImportantToFooterCSS(CSS_RAW);

  function ensureFontAndStyles() {
    // Inject the Space Grotesk font link only if it doesn't already exist.
    if (!document.querySelector(`link[href="${FONT_CDN_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_CDN_URL;
      document.head.appendChild(link);
    }

    if (!document.getElementById("adsg-footer-style")) {
      const style = document.createElement("style");
      style.id = "adsg-footer-style";
      style.type = "text/css";
      style.appendChild(document.createTextNode(CSS));
      document.head.appendChild(style);
    }
  }

  function attachNewsletterHandler(footerEl) {
    const form = footerEl.querySelector("form.adsg-footer__form");
    const successEl = footerEl.querySelector(".adsg-footer__success");
    const input = footerEl.querySelector(".adsg-footer__input");

    if (!form || !successEl) return;

    // Avoid duplicate submit handlers if footer is reinjected.
    if (form.dataset.adsgFooterHandlerAttached === "1") return;
    form.dataset.adsgFooterHandlerAttached = "1";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Show success message and clear input (pure front-end behavior).
      successEl.style.display = "block";
      if (input) input.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureFontAndStyles();

    document.querySelectorAll("#site-footer").forEach(function (hostEl) {
      hostEl.innerHTML = MASTER_FOOTER_HTML;
      const footerEl = hostEl.querySelector("footer.adsg-footer");
      if (footerEl) attachNewsletterHandler(footerEl);
    });
  });
})();
