"use client";

import { useRouter } from "next/navigation";

/**
 * Returns where you actually came from.
 *
 * The item screen used to hardcode "← Closet", but it is reached from Today,
 * from the Outfits board and from the worn log just as often, and all three
 * were dropped into the catalogue on the way back. History is the only thing
 * that knows the answer; the closet is the fallback for a cold load.
 */
export default function BackLink({ fallback = "/closet" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted transition-colors hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}
