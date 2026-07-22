const path = require('path');

/**
 * Served under adsgupta.com/platform/* via rewrite. Without assetPrefix, the
 * browser requests /_next/* on adsgupta.com (CRA) and the page stays on Loading….
 */
const assetPrefix =
  process.env.NEXT_PUBLIC_PLATFORM_ASSET_PREFIX ||
  (process.env.VERCEL_ENV === 'production'
    ? 'https://platform-adsgupta.vercel.app'
    : undefined);

/** @type {import('next').NextConfig} */
const config = {
  assetPrefix,
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
