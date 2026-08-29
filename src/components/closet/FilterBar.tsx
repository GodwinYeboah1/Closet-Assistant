"use client";

import {
  CATEGORY_LABELS,
  COLOR_SWATCHES,
  type Category,
  type ClothingItem,
  type ColorName,
} from "@/lib/types";

export type SortKey = "recent" | "least-worn" | "longest-unworn";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Newest" },
  { key: "longest-unworn", label: "Not worn lately" },
  { key: "least-worn", label: "Least worn" },
];

/** Only offers filters the closet can actually satisfy — no dead chips. */
export default function FilterBar({
  items,
  category,
  color,
  sort,
  onCategory,
  onColor,
  onSort,
}: {
  items: ClothingItem[];
  category: Category | null;
  color: ColorName | null;
  sort: SortKey;
  onCategory: (value: Category | null) => void;
  onColor: (value: ColorName | null) => void;
  onSort: (value: SortKey) => void;
}) {
  const categories = [...new Set(items.map((item) => item.category))];
  const colors = [...new Set(items.map((item) => item.color))];

  return (
    <div className="space-y-3 px-5 pb-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={category === null} onClick={() => onCategory(null)}>
          All
        </Chip>
        {categories.map((value) => (
          <Chip
            key={value}
            active={category === value}
            onClick={() => onCategory(category === value ? null : value)}
          >
            {CATEGORY_LABELS[value]}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <div className="flex shrink-0 gap-1.5">
          {colors.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={value}
              aria-pressed={color === value}
              onClick={() => onColor(color === value ? null : value)}
              className={`h-6 w-6 rounded-full border transition-transform active:scale-90 ${
                color === value
                  ? "border-clay ring-2 ring-clay/40 scale-110"
                  : "border-line"
              }`}
              style={{ backgroundColor: COLOR_SWATCHES[value] }}
            />
          ))}
        </div>

        <div className="ml-auto flex shrink-0 gap-2">
          {SORTS.map((option) => (
            <Chip
              key={option.key}
              active={sort === option.key}
              onClick={() => onSort(option.key)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-clay bg-clay-soft text-clay font-medium"
          : "border-line bg-card text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
