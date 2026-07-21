/** @type {import('next').NextConfig} */
const path = require('path');

const amazonAuditSrc = path.resolve(__dirname, '../../packages/amazon-audit/src');

const nextConfig = {
  transpilePackages: ['@adsgupta/ui', '@adsgupta/config', '@adsgupta/amazon-audit'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@adsgupta/amazon-audit': amazonAuditSrc,
      // Temporary bridge: local services still import @/app/audit/*
      '@/app/audit': path.join(amazonAuditSrc, 'audit'),
    };
    return config;
  },
};

module.exports = nextConfig;
