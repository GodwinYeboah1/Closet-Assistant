"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";

/** One row, one tap. Category is the only thing we ask for at capture time. */
export default function CategoryStrip({ onPick }: { onPick: (category: Category) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((category, index) => (
        <button
          key={category}
          type="button"
          onClick={() => onPick(category)}
          style={{ animationDelay: `${index * 28}ms` }}
          className="animate-rise inline-flex min-h-12 shrink-0 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur transition-transform active:scale-95 hover:bg-white/20"
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  );
}
