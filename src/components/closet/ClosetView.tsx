"use client";

import { useMemo, useState } from "react";
import { daysSince } from "@/lib/format";
import { useCloset } from "@/lib/useCloset";
import type { Category, ColorName } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import FilterBar, { type SortKey } from "./FilterBar";
import ItemCard from "./ItemCard";

export default function ClosetView() {
  const { items, ready } = useCloset();
  const [category, setCategory] = useState<Category | null>(null);
  const [color, setColor] = useState<ColorName | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");

  const visible = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        (category === null || item.category === category) &&
        (color === null || item.color === color),
    );
    const sorted = [...filtered];
    if (sort === "least-worn") {
      sorted.sort((a, b) => a.wearCount - b.wearCount);
    } else if (sort === "longest-unworn") {
      // Never-worn items sort first: they're the ones you've forgotten.
      sorted.sort((a, b) => (daysSince(b.lastWornAt) ?? 1e6) - (daysSince(a.lastWornAt) ?? 1e6));
    }
    return sorted;
  }, [items, category, color, sort]);

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-2xl">
      <PageHeader
        title="Closet"
        subtitle={
          items.length
            ? `${items.length} item${items.length === 1 ? "" : "s"} catalogued`
            : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing catalogued yet"
          body="Photograph what you own — a shelf at a time. Each shot is cleaned up and filed by category so outfit suggestions have something to work with."
          cta={{ href: "/capture", label: "Open camera" }}
        />
      ) : (
        <>
          <FilterBar
            items={items}
            category={category}
            color={color}
            sort={sort}
            onCategory={setCategory}
            onColor={setColor}
            onSort={setSort}
          />
          {visible.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Nothing matches those filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-3">
              {visible.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
