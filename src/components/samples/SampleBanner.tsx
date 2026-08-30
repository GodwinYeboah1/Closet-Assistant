"use client";

import { clearSamples } from "@/lib/store";

/**
 * One line, not a card.
 *
 * This was a bordered panel with four lines of copy and its own button — 138px
 * of a phone screen to say something the reader needs once. It is a note, so it
 * reads as a note.
 */
export default function SampleBanner({ count }: { count: number }) {
  return (
    <p className="px-5 pb-4 text-sm text-muted">
      {count} of these are examples.{" "}
      <button
        type="button"
        onClick={clearSamples}
        /* -my-3/py-3 keeps the 44px hit area without moving the text in the line. */
        className="-my-3 py-3 text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        Clear them
      </button>
    </p>
  );
}
