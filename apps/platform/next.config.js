const path = require('path');

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@adsgupta/auth', '@adsgupta/identity'],
  typescript: {
    // Monorepo may resolve duplicate @types/react across workspaces
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@adsgupta/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@adsgupta/identity': path.resolve(__dirname, '../../packages/identity/src'),
    };
    return config;
  },
};

module.exports = config;
