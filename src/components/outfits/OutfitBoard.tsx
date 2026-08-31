"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clearFeedbackFor, markWorn, recordFeedback, saveOutfit } from "@/lib/store";
import { suggestOutfit, type Suggestion } from "@/lib/suggest";
import {
  CATEGORY_LABELS,
  OCCASIONS,
  OCCASION_LABELS,
  type Occasion,
  type TimeSlot,
} from "@/lib/types";
import { useCloset, useTaste } from "@/lib/useCloset";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import OutfitCard from "./OutfitCard";
import OutfitTabs from "./OutfitTabs";
import WearControls from "./WearControls";

export default function OutfitBoard() {
  const { items, ready } = useCloset();
  const taste = useTaste();
  const [occasion, setOccasion] = useState<Occasion>("everyday");
  const [seed, setSeed] = useState(0);
  /**
   * The outfit exactly as it was when it was logged — see TodayView for why.
   * `markWorn` rewrites the items the ranker scores from, so without this the
   * card re-picks every piece the instant "Wearing this" is tapped.
   */
  const [logged, setLogged] = useState<Suggestion | null>(null);
  /** `null` means the entry stands for the whole day — the default, always. */
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  /** The logged outfit's id, so a "love this" verdict can be attached to it. */
  const [loggedId, setLoggedId] = useState<string | null>(null);
  const [loved, setLoved] = useState(false);

  const live = useMemo(
    () => suggestOutfit(items, occasion, seed, taste),
    [items, occasion, seed, taste],
  );
  const suggestion = logged ?? live;

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl">
        <PageHeader title="Outfits" />
        <OutfitTabs />
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
      <OutfitTabs />

      <div className="flex flex-wrap gap-2 px-5 pb-6">
        {OCCASIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setOccasion(value);
              setLogged(null);
              setLoggedId(null);
              setLoved(false);
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

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setSeed((n) => n + 1);
                  setLogged(null);
                  setLoggedId(null);
                  setLoved(false);
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm transition-transform active:scale-95"
              >
                Try another
              </button>
              <WearControls
                logged={logged !== null}
                loved={loved}
                slot={slot}
                onSlot={setSlot}
                onLog={() => {
                  setLogged(live);
                  live.items.forEach((item) => markWorn(item.id));
                  const outfit = saveOutfit({
                    itemIds: live.items.map((item) => item.id),
                    occasion,
                    slot: slot ?? undefined,
                    wornAt: new Date().toISOString(),
                  });
                  setLoggedId(outfit.id);
                  setLoved(false);
                }}
                onLove={() => {
                  if (!loggedId) return;
                  if (loved) {
                    clearFeedbackFor(loggedId);
                    setLoved(false);
                    return;
                  }
                  recordFeedback({
                    itemIds: (logged ?? live).items.map((item) => item.id),
                    occasion,
                    verdict: "liked",
                    outfitId: loggedId,
                  });
                  setLoved(true);
                }}
                onReject={() => {
                  recordFeedback({
                    itemIds: live.items.map((item) => item.id),
                    occasion,
                    verdict: "disliked",
                  });
                  setSeed((n) => n + 1);
                  setLogged(null);
                }}
                onLogAnother={() => {
                  setLogged(null);
                  setLoggedId(null);
                  setLoved(false);
                  setSeed((n) => n + 1);
                }}
              />
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
