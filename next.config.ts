import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating Next.js dev-tools badge in the corner during `next dev`.
  // It never shipped to production, but it sat on top of the catalog grid.
  // Compile and runtime errors still surface normally.
  devIndicators: false,
  // Phone / LAN access goes through an HTTPS tunnel (see `npm run phone`).
  // Without these, Next blocks cross-origin requests to dev assets from the
  // tunnel hostname, so the page loads blank or half-broken on a real device.
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.localtunnel.me",
  ],
};

export default nextConfig;
