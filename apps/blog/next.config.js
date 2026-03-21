/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@adsgupta/ui", "@adsgupta/config"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("better-sqlite3");
    }
    return config;
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/archives", permanent: true },
      { source: "/blog/:path*", destination: "/archives/:path*", permanent: true },
    ];
  },
};

module.exports = nextConfig;
