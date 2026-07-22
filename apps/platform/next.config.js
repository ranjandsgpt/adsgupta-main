/**
 * Apex deploy for adsgupta.com (Vercel project: adsgupta-main, root: apps/platform).
 *
 * - `/platform/*` → Next.js App Router (auth + tools hub)
 * - everything else → CRA marketing site copied into public/ at build time
 *
 * assetPrefix only when rewriting FROM another host (legacy platform-adsgupta).
 * Same-origin apex must leave it unset so /_next loads from adsgupta.com.
 */
const path = require('path');

const assetPrefix = process.env.NEXT_PUBLIC_PLATFORM_ASSET_PREFIX || undefined;

/** @type {import('next').NextConfig} */
const config = {
  assetPrefix,
  transpilePackages: ['@adsgupta/auth', '@adsgupta/identity'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // SPA fallback for CRA client routes (/, /talentos, /tools, …).
    // App Router `/platform/*` wins first; these only apply when unmatched.
    return {
      fallback: [
        { source: '/', destination: '/index.html' },
        { source: '/:path*', destination: '/index.html' },
      ],
    };
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
