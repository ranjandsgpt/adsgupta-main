import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#121212] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Last updated: December 2025
              </p>

              <div className="space-y-8 text-zinc-300">
                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">1. Information We Collect</h2>
                  <p className="leading-relaxed">
                    Ads Gupta collects information you provide directly, including name, email address, company information, and partnership inquiries submitted through our contact forms. We also collect usage data through analytics to improve our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">2. How We Use Your Information</h2>
                  <p className="leading-relaxed">
                    We use collected information to respond to inquiries, provide requested services, send relevant communications about our platform, and improve user experience. We do not sell your personal information to third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">3. Data Security</h2>
                  <p className="leading-relaxed">
                    We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">4. Cookies and Tracking</h2>
                  <p className="leading-relaxed">
                    Our website uses cookies to enhance functionality and analyze traffic. You can control cookie preferences through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">5. Contact Us</h2>
                  <p className="leading-relaxed">
                    For privacy-related inquiries, please contact us at{' '}
                    <a href="mailto:privacy@adsgupta.com" className="text-cyan-400 hover:underline">
                      privacy@adsgupta.com
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default PrivacyPage;
