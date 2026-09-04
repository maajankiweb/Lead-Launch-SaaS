import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Next.js root directory for Turbopack to prevent monorepo ambiguity
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Enables Vercel Skew Protection to prevent chunk load errors and client-server mismatches
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
};

export default nextConfig;

