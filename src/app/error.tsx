"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * The last line of defence.
 *
 * Anything that throws below the root — a storage write that couldn't fit, a
 * corrupt record — used to blank the screen with no explanation. This says what
 * happened and offers the two things that actually help: try again, or go back
 * to a page that doesn't depend on whatever broke.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const outOfSpace = error.name === "StorageFullError";

  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
        <h1 className="text-base font-medium">
          {outOfSpace ? "This device is out of storage" : "Something went wrong"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          {outOfSpace
            ? "Closet Assistant keeps your photos on this device, and there's no room for another one. Deleting a few items frees space up."
            : "Your closet is safe — this screen just failed to draw. Trying again usually clears it."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-canvas transition-transform active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/closet"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm transition-transform active:scale-95"
          >
            Go to closet
          </Link>
        </div>
      </div>
    </main>
  );
}
