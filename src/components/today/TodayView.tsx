"use client";

import Link from "next/link";
import { daysSince } from "@/lib/format";
import { suggestOutfit } from "@/lib/suggest";
import { useCloset } from "@/lib/useCloset";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import ItemCard from "@/components/closet/ItemCard";
import OutfitCard from "@/components/outfits/OutfitCard";

export default function TodayView() {
  const { items, ready } = useCloset();
  if (!ready) return null;

  const suggestion = suggestOutfit(items, "everyday");
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
              <Link href="/outfits" className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline">
                More options
              </Link>
            </div>
            {suggestion.items.length ? (
              <>
                <OutfitCard items={suggestion.items} />
                <p className="mt-3 text-sm text-muted">{suggestion.rationale}</p>
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
