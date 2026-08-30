"use client";

import { useEffect } from "react";
import { SEED_VERSION, buildSampleCloset } from "@/lib/seed";
import { syncSeed } from "@/lib/store";

/**
 * Seeds the starter closet on a first visit, and tops up an existing one when
 * new entries ship. Renders nothing — it exists so the write happens after
 * hydration, on the client, where localStorage lives.
 */
export default function SeedSamples() {
  useEffect(() => {
    syncSeed(buildSampleCloset, SEED_VERSION);
  }, []);

  return null;
}
