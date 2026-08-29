"use client";

import { CATEGORY_LABELS, type Category } from "@/lib/types";

/** The beat between "I took a photo" and "it's in my closet". */
export default function SavedConfirmation({
  category,
  total,
}: {
  category: Category;
  total: number;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-shell/80 backdrop-blur-sm">
      <div className="animate-rise flex flex-col items-center gap-3">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-clay">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              className="animate-stroke"
              d="M6 12.5l4 4 8-9"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-base font-medium">{CATEGORY_LABELS[category]} added</p>
        <p className="font-mono text-xs text-white/50">
          {total} item{total === 1 ? "" : "s"} this session
        </p>
      </div>
    </div>
  );
}
