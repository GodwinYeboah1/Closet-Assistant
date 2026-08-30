import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating Next.js dev-tools badge in the corner during `next dev`.
  // It never shipped to production, but it sat on top of the catalog grid.
  // Compile and runtime errors still surface normally.
  devIndicators: false,
};

export default nextConfig;
