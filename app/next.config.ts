import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables Vercel Skew Protection to prevent chunk load errors and client-server mismatches
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
};

export default nextConfig;

