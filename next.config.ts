import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Raised from the 1MB default so CV PDF uploads (Server Action)
      // don't get rejected — see PLAN.md Phase 3.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
