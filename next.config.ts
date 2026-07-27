import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows @react-email/render to work in API routes (server-side)
  serverExternalPackages: ["@react-email/render"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
