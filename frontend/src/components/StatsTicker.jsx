import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';

export const StatsTicker = () => {
  const stats = [
    { label: 'Impressions Served', value: '12.4B+' },
    { label: 'Active Campaigns', value: '45,000+' },
    { label: 'Conversion Rate Lift', value: '340%' },
    { label: 'Partners Worldwide', value: '1,200+' },
    { label: 'AI Models Active', value: '156' },
    { label: 'Data Points Processed', value: '8T+' },
  ];

  return (
    <motion.section
      id="network"
      data-testid="stats-ticker"
      className="stats-ticker py-5 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Marquee
        speed={40}
        gradient={true}
        gradientColor="#0A0A0A"
        gradientWidth={100}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-8 mx-12"
            data-testid={`stat-item-${index}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 text-2xl md:text-3xl font-bold font-['Space_Grotesk']">
                {stat.value}
              </span>
              <span className="text-zinc-500 text-sm font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
          </div>
        ))}
      </Marquee>
    </motion.section>
  );
};

export default StatsTicker;
