"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { daysSince } from "@/lib/format";
import { markWorn, saveOutfit } from "@/lib/store";
import { suggestOutfit, type Suggestion } from "@/lib/suggest";
import { useCloset } from "@/lib/useCloset";
import type { TimeSlot } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import ItemCard from "@/components/closet/ItemCard";
import OutfitCard from "@/components/outfits/OutfitCard";
import WearControls from "@/components/outfits/WearControls";

export default function TodayView() {
  const { items, ready } = useCloset();
  // Today used to render seed 0 forever: it called `suggestOutfit` with the
  // default seed and "More options" was a link to /outfits, so the card could
  // never change no matter how many times it was tapped. The suggester already
  // rotates on `seed`; this screen just never moved it.
  const [seed, setSeed] = useState(0);
  /**
   * The outfit exactly as it was when it was logged.
   *
   * Logging calls `markWorn`, which rewrites the very items the ranker scores
   * from: the pieces lose their rest bonus and gain a wear. With `items` in the
   * memo deps that recomputed instantly, so every piece on the card swapped the
   * moment you tapped, while the button read "Logged for today". Freezing the
   * suggestion keeps the card showing what was actually logged.
   */
  const [logged, setLogged] = useState<Suggestion | null>(null);
  /** `null` means the entry stands for the whole day — the default, always. */
  const [slot, setSlot] = useState<TimeSlot | null>(null);

  const live = useMemo(
    () => suggestOutfit(items, "everyday", seed),
    [items, seed],
  );
  const suggestion = logged ?? live;

  if (!ready) return null;

  const resting = items.filter((item) => {
    const days = daysSince(item.lastWornAt);
    return days === null || days > 30;
  });

  return (
    <main className="mx-auto max-w-2xl">
      <PageHeader
        title="Today"
        subtitle={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Start with one shelf"
          body="Photograph the clothes you actually reach for. Once a handful of items are in, Closet Assistant can put outfits together from them."
          cta={{ href: "/capture", label: "Open camera" }}
        />
      ) : (
        <div className="space-y-8 px-5">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium">Wear today</h2>
              <button
                type="button"
                onClick={() => {
                  setSeed((n) => n + 1);
                  setLogged(null);
                }}
                className="-mr-2 inline-flex min-h-11 items-center px-2 text-sm text-muted underline-offset-4 hover:underline"
              >
                Try another
              </button>
            </div>
            {suggestion.items.length ? (
              <>
                <OutfitCard key={seed} items={suggestion.items} />
                <p className="mt-3 text-sm text-muted">{suggestion.rationale}</p>
                <WearControls
                  logged={logged !== null}
                  slot={slot}
                  onSlot={setSlot}
                  onLog={() => {
                    setLogged(live);
                    live.items.forEach((item) => markWorn(item.id));
                    saveOutfit({
                      itemIds: live.items.map((item) => item.id),
                      occasion: "everyday",
                      slot: slot ?? undefined,
                      wornAt: new Date().toISOString(),
                    });
                  }}
                  onLogAnother={() => {
                    setLogged(null);
                    setSeed((n) => n + 1);
                  }}
                />
                <p className="mt-3 text-sm">
                  <Link href="/outfits/history" className="text-muted underline-offset-4 hover:underline">
                    See everything you&apos;ve worn
                  </Link>
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                Add a top, a bottom and shoes and there&apos;ll be an outfit here.
              </p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium">
                {resting.length ? "Haven't worn in a while" : "Recently added"}
              </h2>
              <Link href="/closet" className="-mr-2 inline-flex min-h-11 items-center px-2 text-sm text-muted underline-offset-4 hover:underline">
                All {items.length}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(resting.length ? resting : items).slice(0, 6).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
