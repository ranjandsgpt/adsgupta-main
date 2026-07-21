const path = require('path');

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@adsgupta/amazon-audit', '@adsgupta/ui'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@adsgupta/amazon-audit': path.resolve(__dirname, '../../packages/amazon-audit/src'),
    };
    return config;
  },
};

module.exports = config;
