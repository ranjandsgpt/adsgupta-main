import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@adsgupta/ui", "@adsgupta/config"],
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
