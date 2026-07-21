const path = require('path');

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@adsgupta/amazon-audit', '@adsgupta/auth', '@adsgupta/ui'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@adsgupta/amazon-audit': path.resolve(__dirname, '../../packages/amazon-audit/src'),
      '@adsgupta/auth': path.resolve(__dirname, '../../packages/auth/src'),
    };
    return config;
  },
};

module.exports = config;
