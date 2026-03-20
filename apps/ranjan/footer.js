(function(){
  const FOOTER_HTML = "<footer data-testid=\"footer-section\" class=\"relative py-16 md:py-24 bg-[#0A0A0A] border-t border-white/5\"><div class=\"max-w-[1200px] mx-auto px-6 md:px-12\"><div class=\"grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16\"><div style=\"opacity: 1; transform: none;\"><h3 class=\"text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-4 tracking-tight\">Stay Ahead of<br>the Curve</h3><p class=\"text-zinc-400 text-lg mb-8 max-w-md\">Get exclusive insights on AI advertising, delivered to your inbox.</p><form class=\"flex gap-3\"><input placeholder=\"Enter your email\" data-testid=\"newsletter-input\" class=\"newsletter-input flex-1 px-5 py-4 rounded-full text-white placeholder-zinc-500 font-medium\" required=\"\" type=\"email\" value=\"\"><button type=\"submit\" data-testid=\"newsletter-submit\" data-hoverable=\"true\" class=\"glow-button w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400\" tabindex=\"0\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-arrow-right\" aria-hidden=\"true\"><path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path></svg></button></form></div><div class=\"grid grid-cols-2 md:grid-cols-4 gap-8\" style=\"opacity: 1; transform: none;\"><div><h4 class=\"text-white font-semibold mb-4 text-sm tracking-wide\">Platform</h4><ul class=\"space-y-3\"><li><a href=\"https://demoai.adsgupta.com\" target=\"_blank\" rel=\"noopener noreferrer\" data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\">AI Sandbox</a></li><li><a href=\"/#features\" data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\">Features</a></li><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/\" data-discover=\"true\">Pricing</a></li></ul></div><div><h4 class=\"text-white font-semibold mb-4 text-sm tracking-wide\">Resources</h4><ul class=\"space-y-3\"><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/blog\" data-discover=\"true\">Blog</a></li><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/\" data-discover=\"true\">Documentation</a></li><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/\" data-discover=\"true\">API</a></li></ul></div><div><h4 class=\"text-white font-semibold mb-4 text-sm tracking-wide\">Company</h4><ul class=\"space-y-3\"><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/aboutme\" data-discover=\"true\">About</a></li><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/contact\" data-discover=\"true\">Contact</a></li><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/\" data-discover=\"true\">Careers</a></li></ul></div><div><h4 class=\"text-white font-semibold mb-4 text-sm tracking-wide\">Legal</h4><ul class=\"space-y-3\"><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/privacy\" data-discover=\"true\">Privacy Policy</a></li><li><a data-hoverable=\"true\" class=\"text-zinc-500 hover:text-white transition-colors duration-300 text-sm\" href=\"/terms\" data-discover=\"true\">Terms of Service</a></li></ul></div></div></div><div class=\"pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6\"><div class=\"flex items-center gap-6\"><a class=\"text-2xl font-bold text-white font-['Space_Grotesk']\" href=\"/\" data-discover=\"true\">ADS<span class=\"text-cyan-400\">GUPTA</span></a><span class=\"text-zinc-600 text-sm\">© 2025 Ads Gupta. All rights reserved.</span></div><div class=\"flex items-center gap-4\"><a href=\"#\" data-testid=\"social-twitter\" data-hoverable=\"true\" class=\"w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors duration-300\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-twitter\" aria-hidden=\"true\"><path d=\"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z\"></path></svg></a><a href=\"#\" data-testid=\"social-linkedin\" data-hoverable=\"true\" class=\"w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors duration-300\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-linkedin\" aria-hidden=\"true\"><path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"></path><rect width=\"4\" height=\"12\" x=\"2\" y=\"9\"></rect><circle cx=\"4\" cy=\"4\" r=\"2\"></circle></svg></a></div></div></div></footer>\n\n\n\n";

  const FONT_CDN_URL =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap";

  // Master footer HTML: pure HTML + inline SVGs (no React, no Tailwind runtime).
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </form>

            <div class="adsg-footer__success" role="status" aria-live="polite" aria-atomic="true" style="display:none;"></div>
          </div>

          <div class="adsg-footer__right" aria-label="Footer navigation">
            <div class="adsg-footer__grid">
              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Platform</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="https://demoai.adsgupta.com" target="_blank" rel="noopener noreferrer" class="adsg-footer__link">AI Sandbox</a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/#features" class="adsg-footer__link">Features</a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">Pricing</a>
                  </li>
                </ul>
              </div>

              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Resources</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="/insights" class="adsg-footer__link">Blog</a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">Documentation</a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">API</a>
                  </li>
                </ul>
              </div>

              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Company</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="/about" class="adsg-footer__link">About</a>
                  </li>
                  <li>
                    <a href="/contact" class="adsg-footer__link">Contact</a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/" class="adsg-footer__link">Careers</a>
                  </li>
                </ul>
              </div>

              <div class="adsg-footer__col">
                <h4 class="adsg-footer__heading">Legal</h4>
                <ul class="adsg-footer__list">
                  <li>
                    <a href="https://adsgupta.com/privacy" class="adsg-footer__link">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="https://adsgupta.com/terms" class="adsg-footer__link">Terms of Service</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="adsg-footer__bottom">
          <div class="adsg-footer__brand">
            <a class="adsg-footer__brand-link" href="https://adsgupta.com">
              ADS<span class="adsg-footer__brand-accent">GUPTA</span>
            </a>
            <span class="adsg-footer__copyright">© 2026 Ads Gupta. All rights reserved.</span>
          </div>

          <div class="adsg-footer__social">
            <a href="https://twitter.com/adsgupta" target="_blank" rel="noopener noreferrer" data-testid="social-twitter" class="adsg-footer__icon" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="https://linkedin.com/company/adsgupta" target="_blank" rel="noopener noreferrer" data-testid="social-linkedin" class="adsg-footer__icon" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;

  const CSS = `
    /* Scoped styles for adsgupta footer.js (no Tailwind runtime required) */
    .adsg-footer{position:relative;background:#0A0A0A;border-top:1px solid rgba(255,255,255,0.05);padding:64px 0;}
    @media (min-width:768px){.adsg-footer{padding:96px 0;}}
    .adsg-footer__container{max-width:1200px;margin:0 auto;padding:0 24px;}
    @media (min-width:768px){.adsg-footer__container{padding:0 48px;}}
    .adsg-footer__main{display:grid;grid-template-columns:1fr;gap:48px;margin-bottom:64px;}
    @media (min-width:1024px){.adsg-footer__main{grid-template-columns:1fr 1fr;gap:80px;}}
    .adsg-footer__title{margin:0 0 16px 0;font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:30px;line-height:1.15;font-weight:700;color:#fff;letter-spacing:-0.02em;}
    @media (min-width:768px){.adsg-footer__title{font-size:36px;}}
    .adsg-footer__subtitle{margin:0 0 32px 0;font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#a1a1aa;font-size:18px;line-height:1.6;max-width:448px;}
    .adsg-footer__form{display:flex;gap:12px;align-items:center;}
    .adsg-footer__input{flex:1;padding:16px 20px;border-radius:9999px;border:0;outline:none;background:transparent;color:#fff;font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;}
    .adsg-footer__input::placeholder{color:#71717a;}
    .adsg-footer__submit{width:56px;height:56px;border:0;border-radius:9999px;background:#06b6d4;color:#000;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .15s ease-in-out;}
    .adsg-footer__submit:hover{background:#22d3ee;}
    .adsg-footer__success{margin-top:12px;color:#22d3ee;font-size:14px;line-height:1.4;display:none;}

    .adsg-footer__grid{display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:32px;}
    @media (min-width:768px){.adsg-footer__grid{grid-template-columns:repeat(4, minmax(0, 1fr));}}
    .adsg-footer__heading{margin:0 0 16px 0;color:#fff;font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.08em;}
    .adsg-footer__list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;}
    .adsg-footer__link{color:#71717a;text-decoration:none;font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.4;transition:color .2s ease-in-out;}
    .adsg-footer__link:hover{color:#fff;}

    .adsg-footer__bottom{padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:24px;align-items:flex-start;justify-content:space-between;}
    @media (min-width:768px){.adsg-footer__bottom{flex-direction:row;align-items:center;}}
    .adsg-footer__brand{display:flex;align-items:center;gap:24px;flex-wrap:wrap;}
    .adsg-footer__brand-link{font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#fff;text-decoration:none;}
    .adsg-footer__brand-accent{color:#22d3ee;}
    .adsg-footer__copyright{color:#52525b;font-family:"Space Grotesk",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.4;}
    .adsg-footer__social{display:flex;gap:16px;align-items:center;}
    .adsg-footer__icon{width:40px;height:40px;border-radius:9999px;background:rgba(255,255,255,0.05);color:#a1a1aa;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:background-color .2s ease-in-out,color .2s ease-in-out;}
    .adsg-footer__icon:hover{background:rgba(255,255,255,0.10);color:#fff;}
  `;

  function ensureFontAndStyles() {
    if (!document.getElementById("adsg-footer-font")) {
      const link = document.createElement("link");
      link.id = "adsg-footer-font";
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
    if (!form || !successEl) return;

    // Guard against duplicate handlers when footer is reinjected.
    if (form.dataset.adsgFooterHandlerAttached === "1") return;
    form.dataset.adsgFooterHandlerAttached = "1";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      successEl.textContent = "Thanks! You are subscribed.";
      successEl.style.display = "block";

      const input = footerEl.querySelector(".adsg-footer__input");
      if (input) input.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureFontAndStyles();

    document.querySelectorAll("#site-footer").forEach(function (hostEl) {
      hostEl.innerHTML = MASTER_FOOTER_HTML;
      const footerEl = hostEl.querySelector(".adsg-footer");
      if (footerEl) attachNewsletterHandler(footerEl);
    });
  });
})();
