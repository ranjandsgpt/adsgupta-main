/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@adsgupta/ui", "@adsgupta/config", "@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  async redirects() {
    return [
      { source: "/blog", destination: "/archives", permanent: true },
      { source: "/blog/:path*", destination: "/archives/:path*", permanent: true },
    ];
  },
};

module.exports = nextConfig;
