import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API requests are now handled by the catch-all API route at app/api/[...path]/route.ts
  // This properly forwards cookies and headers to the backend
};

export default nextConfig;
