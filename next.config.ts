import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Disable static page generation for all routes during build
  experimental: {
    ppr: false,
  },
};

export default nextConfig;
