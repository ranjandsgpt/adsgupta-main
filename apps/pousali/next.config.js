/** @type {import('next').NextConfig} */
const path = require('path');

const amazonAuditSrc = path.resolve(__dirname, '../../packages/amazon-audit/src');
const authSrc = path.resolve(__dirname, '../../packages/auth/src');
const identitySrc = path.resolve(__dirname, '../../packages/identity/src');

const nextConfig = {
  transpilePackages: [
    '@adsgupta/ui',
    '@adsgupta/config',
    '@adsgupta/amazon-audit',
    '@adsgupta/auth',
    '@adsgupta/identity',
  ],
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
      '@adsgupta/auth': authSrc,
      '@adsgupta/identity': identitySrc,
      '@/app/audit': path.join(amazonAuditSrc, 'audit'),
    };
    return config;
  },
};

module.exports = nextConfig;
