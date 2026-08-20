import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['10.24.171.98', 'localhost:3000'],
};

export default nextConfig;
