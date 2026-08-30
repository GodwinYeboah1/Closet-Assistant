"use client";

import { clearSamples } from "@/lib/store";

/** Shown while any seeded item is still in the closet. One tap removes them all. */
export default function SampleBanner({ count }: { count: number }) {
  return (
    <div className="mx-5 mb-4 flex flex-col items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <p className="flex-1 text-sm text-muted">
        <span className="font-medium text-ink">{count} example item{count === 1 ? "" : "s"}</span>{" "}
        so suggestions have something to work with. Yours will sit alongside them.
      </p>
      <button
        type="button"
        onClick={clearSamples}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line px-4 text-xs transition-transform active:scale-95"
      >
        Clear examples
      </button>
    </div>
  );
}
