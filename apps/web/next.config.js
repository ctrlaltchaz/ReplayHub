/** @type {import('next').NextConfig} */
const path = require("path");
const fs = require("fs");

// Try to load root package.json, fallback to default version if not found
let appVersion = "1.0.0";
try {
  const rootPackagePath = path.join(__dirname, "../../package.json");
  if (fs.existsSync(rootPackagePath)) {
    const rootPackage = require(rootPackagePath);
    appVersion = rootPackage.version;
  }
} catch (e) {
  console.warn("Could not load root package.json, using default version");
}

const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || appVersion,
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
