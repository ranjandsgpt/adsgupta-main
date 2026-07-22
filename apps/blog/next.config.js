const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@adsgupta/ui", "@adsgupta/config", "@adsgupta/auth", "@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@adsgupta/auth": path.resolve(__dirname, "../../packages/auth/src"),
    };
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
