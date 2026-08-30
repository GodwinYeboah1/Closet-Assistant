"use client";

import { useEffect } from "react";
import { buildSampleCloset } from "@/lib/seed";
import { seedSamplesIfEmpty } from "@/lib/store";

/**
 * Seeds the example closet on a first visit. Renders nothing — it exists so the
 * write happens after hydration, on the client, where localStorage lives.
 */
export default function SeedSamples() {
  useEffect(() => {
    seedSamplesIfEmpty(buildSampleCloset);
  }, []);

  return null;
}
