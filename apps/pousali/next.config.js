/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@adsgupta/ui', '@adsgupta/config'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
