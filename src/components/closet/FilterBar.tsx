"use client";

import { useState } from "react";
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

/**
 * Filters live behind one control.
 *
 * Shown open, the three groups cost 228px — on a 390x844 phone that pushed the
 * first garment 490px down the page, so more than half the screen was chrome
 * before a single item. The closet's job is to show clothes. Collapsed, the row
 * still states what's active in words, so nothing is hidden state.
 */
export default function FilterBar({
  items,
  visibleCount,
  category,
  color,
  sort,
  onCategory,
  onColor,
  onSort,
}: {
  items: ClothingItem[];
  visibleCount: number;
  category: Category | null;
  color: ColorName | null;
  sort: SortKey;
  onCategory: (value: Category | null) => void;
  onColor: (value: ColorName | null) => void;
  onSort: (value: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);

  const categories = [...new Set(items.map((item) => item.category))];
  const colors = [...new Set(items.map((item) => item.color))];
  const activeCount = (category ? 1 : 0) + (color ? 1 : 0);

  const summary = [
    category ? CATEGORY_LABELS[category] : null,
    color,
    SORTS.find((s) => s.key === sort)?.label,
  ]
    .filter(Boolean)
    .join(" · ");

  const reset = () => {
    onCategory(null);
    onColor(null);
    onSort("recent");
  };

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
            activeCount > 0
              ? "border-accent bg-accent font-medium text-on-accent"
              : "border-line bg-surface text-ink"
          }`}
        >
          Filter
          {activeCount > 0 ? ` · ${activeCount}` : ""}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <p className="min-w-0 flex-1 truncate text-sm text-muted">{summary}</p>

        <span className="shrink-0 font-mono text-xs text-muted">
          {visibleCount} item{visibleCount === 1 ? "" : "s"}
        </span>
      </div>

      {open ? (
        <div className="animate-rise mt-4 space-y-4 border-t border-line pt-4">
          <Group label="Category">
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
          </Group>

          <Group label="Colour">
            {colors.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={value}
                aria-pressed={color === value}
                onClick={() => onColor(color === value ? null : value)}
                className="grid h-11 w-11 place-items-center transition-transform active:scale-90"
              >
                {/* 44px hit area, 26px dot — the target has to be thumb-sized. */}
                <span
                  className={`h-[26px] w-[26px] rounded-full ring-1 ring-black/15 dark:ring-white/20 ${
                    color === value ? "ring-2 ring-accent" : ""
                  }`}
                  style={{ backgroundColor: COLOR_SWATCHES[value] }}
                />
              </button>
            ))}
          </Group>

          <Group label="Sort">
            {SORTS.map((option) => (
              <Chip key={option.key} active={sort === option.key} onClick={() => onSort(option.key)}>
                {option.label}
              </Chip>
            ))}
          </Group>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow mb-2 text-muted">{label}</h3>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
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
      className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm transition-colors ${
        active
          ? "border-accent bg-accent font-medium text-on-accent"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
