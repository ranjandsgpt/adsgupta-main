import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import { ChatBot } from '../components/ChatBot';

const TermsPage = () => {
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
              Terms of Service
            </h1>
            
            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Last updated: December 2025
              </p>

              <div className="space-y-8 text-zinc-300">
                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">1. Acceptance of Terms</h2>
                  <p className="leading-relaxed">
                    By accessing and using the Ads Gupta platform and website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">2. Description of Services</h2>
                  <p className="leading-relaxed">
                    Ads Gupta provides AI-powered advertising technology solutions, including but not limited to neural targeting, real-time optimization, and predictive analytics for digital advertising campaigns.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">3. User Responsibilities</h2>
                  <p className="leading-relaxed">
                    Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You agree to use our services only for lawful purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">4. Intellectual Property</h2>
                  <p className="leading-relaxed">
                    All content, features, and functionality of the Ads Gupta platform are owned by Ads Gupta and are protected by intellectual property laws. Unauthorized use is prohibited.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">5. Limitation of Liability</h2>
                  <p className="leading-relaxed">
                    Ads Gupta shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">6. Contact</h2>
                  <p className="leading-relaxed">
                    For questions about these Terms of Service, please contact us at{' '}
                    <a href="mailto:legal@adsgupta.com" className="text-cyan-400 hover:underline">
                      legal@adsgupta.com
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

export default TermsPage;
