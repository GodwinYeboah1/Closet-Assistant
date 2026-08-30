"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { markWorn, saveOutfit } from "@/lib/store";
import { suggestOutfit } from "@/lib/suggest";
import { CATEGORY_LABELS, OCCASIONS, OCCASION_LABELS, type Occasion } from "@/lib/types";
import { useCloset } from "@/lib/useCloset";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import OutfitCard from "./OutfitCard";

export default function OutfitBoard() {
  const { items, ready } = useCloset();
  const [occasion, setOccasion] = useState<Occasion>("everyday");
  const [seed, setSeed] = useState(0);
  const [worn, setWorn] = useState(false);

  const suggestion = useMemo(
    () => suggestOutfit(items, occasion, seed),
    [items, occasion, seed],
  );

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl">
        <PageHeader title="Outfits" />
        <EmptyState
          title="Suggestions need a closet first"
          body="Everything suggested here comes from clothes you've photographed — nothing is invented and nothing is for sale. Add a few items to get started."
          cta={{ href: "/capture", label: "Add items" }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl">
      <PageHeader
        title="Outfits"
        subtitle="Combinations built only from what you own."
      />

      <div className="flex flex-wrap gap-2 px-5 pb-6">
        {OCCASIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setOccasion(value);
              setWorn(false);
            }}
            aria-pressed={occasion === value}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm transition-colors ${
              occasion === value
                ? "border-accent bg-accent font-medium text-on-accent"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {OCCASION_LABELS[value]}
          </button>
        ))}
      </div>

      <section className="mx-5 rounded-2xl border border-line bg-surface p-5">
        {suggestion.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nothing in the closet fits this yet.
          </p>
        ) : (
          <>
            <OutfitCard key={`${occasion}-${seed}`} items={suggestion.items} />
            <p className="mt-4 text-sm leading-relaxed text-muted">{suggestion.rationale}</p>

            {suggestion.missing.length > 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                No {suggestion.missing.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(" or ")} catalogued yet —{" "}
                <Link href="/capture" className="underline underline-offset-4">
                  add some
                </Link>{" "}
                for a fuller suggestion.
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSeed((n) => n + 1);
                  setWorn(false);
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm transition-transform active:scale-95"
              >
                Try another
              </button>
              <button
                type="button"
                disabled={worn}
                onClick={() => {
                  suggestion.items.forEach((item) => markWorn(item.id));
                  saveOutfit({
                    itemIds: suggestion.items.map((item) => item.id),
                    occasion,
                    wornAt: new Date().toISOString(),
                  });
                  setWorn(true);
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-transform active:scale-95 disabled:opacity-50"
              >
                {worn ? "Logged for today" : "Wearing this"}
              </button>
            </div>
          </>
        )}
      </section>

      <p className="px-5 pt-6 text-xs leading-relaxed text-muted">
        Tag items with the occasions they suit — on the item screen — and suggestions get
        noticeably better.
      </p>
    </main>
  );
}
