/** @type {import('next').NextConfig} */
const rootPackage = require("../../package.json");

const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || rootPackage.version,
  },
  experimental: {
    outputFileTracingRoot: require("path").join(__dirname, "../../"),
  },
  transpilePackages: ["@esports-ops/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.replayhub.app",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "assets.mckeonwebsolutions.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
