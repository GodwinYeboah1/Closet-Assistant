"use client";

import { useMemo, useState } from "react";
import {
  ALL_DAY_LABEL,
  OCCASION_LABELS,
  TIME_SLOTS,
  TIME_SLOT_LABELS,
  type Occasion,
  type Outfit,
  type TimeSlot,
} from "@/lib/types";
import { localDayKey } from "@/lib/format";
import { useCloset, useOutfits } from "@/lib/useCloset";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import OutfitCard from "./OutfitCard";
import OutfitTabs from "./OutfitTabs";

/**
 * The log of what was actually worn.
 *
 * The day is the unit people scan, so the day is the heading and entries sit
 * under it — a date is never repeated down the page. Days read newest first;
 * within a day, entries read forwards, the order the day happened in.
 *
 * Filtering is one row, not a panel: the closet's FilterBar had to collapse
 * behind a button because three open groups cost half a phone screen, and a log
 * has one useful axis rather than three. The row only offers tags that actually
 * appear in the log, so it stays short and never presents a filter that would
 * empty the page.
 */

/** A filterable tag: a time slot, or the occasion the outfit was built for. */
type Tag = { key: string; label: string };

function tagsOf(outfit: Outfit): Tag[] {
  const tags: Tag[] = [
    { key: `occasion:${outfit.occasion}`, label: OCCASION_LABELS[outfit.occasion] },
  ];
  if (outfit.slot) {
    // Slot first: it's the more specific claim about when this was worn.
    tags.unshift({ key: `slot:${outfit.slot}`, label: TIME_SLOT_LABELS[outfit.slot] });
  }
  return tags;
}

/** "Today" / "Yesterday" / a written date — the log is read by day, not by clock. */
function dayLabel(iso: string): string {
  const then = new Date(iso);
  // Compared as local day keys: differencing timestamps gets this wrong on the
  // two DST days a year, when a "day" is 23 or 25 hours long.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const key = localDayKey(then);
  if (key === localDayKey(new Date())) return "Today";
  if (key === localDayKey(yesterday)) return "Yesterday";
  return then.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: then.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export default function OutfitHistory() {
  const { outfits, ready } = useOutfits();
  const { items } = useCloset();
  const [tag, setTag] = useState<string | null>(null);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  // Deleting a garment no longer deletes the outfits it appeared in, so an id
  // that resolves to nothing is expected: the entry keeps the pieces it still
  // has and says how many are gone. An entry with nothing left to show is
  // dropped, since a card of no garments is noise rather than a record.
  const entries = useMemo(
    () =>
      outfits
        .map((outfit) => ({
          outfit,
          tags: tagsOf(outfit),
          pieces: outfit.itemIds
            .map((id) => byId.get(id))
            .filter((piece) => piece !== undefined),
          missing:
            outfit.itemIds.length -
            outfit.itemIds.filter((id) => byId.has(id)).length,
        }))
        .filter((entry) => entry.pieces.length > 0),
    [outfits, byId],
  );

  /**
   * Only tags present in the log, in a stable order: slots by time of day, then
   * occasions. A filter that can only ever return nothing is worse than absent.
   */
  const available = useMemo(() => {
    const seen = new Map<string, Tag>();
    entries.forEach((entry) => entry.tags.forEach((t) => seen.set(t.key, t)));
    const rank = (key: string) => {
      const [kind, value] = key.split(":");
      if (kind === "slot") return TIME_SLOTS.indexOf(value as TimeSlot);
      return TIME_SLOTS.length + Object.keys(OCCASION_LABELS).indexOf(value as Occasion);
    };
    return [...seen.values()].sort((a, b) => rank(a.key) - rank(b.key));
  }, [entries]);

  const visible = tag
    ? entries.filter((entry) => entry.tags.some((t) => t.key === tag))
    : entries;

  const dayCount = new Set(
    entries.map((e) => localDayKey(e.outfit.wornAt ?? e.outfit.createdAt)),
  ).size;

  // Already sorted newest-day-first, chronological within the day, by the store.
  const days = useMemo(() => {
    const grouped = new Map<string, typeof visible>();
    visible.forEach((entry) => {
      const key = localDayKey(entry.outfit.wornAt ?? entry.outfit.createdAt);
      grouped.set(key, [...(grouped.get(key) ?? []), entry]);
    });
    return [...grouped.entries()];
  }, [visible]);

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Titled "Outfits", not "Worn": the tab row directly beneath already
          says Worn, and stacking the same word twice read as a stutter. The
          tabs are the sub-navigation, so they carry the distinction. */}
      <PageHeader
        title="Outfits"
        subtitle={
          entries.length
            ? `${entries.length} outfit${entries.length === 1 ? "" : "s"} across ` +
              `${dayCount} day${dayCount === 1 ? "" : "s"}.`
            : undefined
        }
      />
      <OutfitTabs />

      {entries.length === 0 ? (
        <EmptyState
          title="Your diary starts with one outfit"
          body="Whatever you wear today, tap “Wearing this” and it lands here — the day, the pieces, and the time of day if you changed. One a day is plenty; some days take two."
          cta={{ href: "/outfits", label: "Pick something to wear" }}
        />
      ) : (
        <>
          {available.length > 1 ? (
            <div className="-mx-5 mb-2 overflow-x-auto px-5 pb-4 [mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] [scrollbar-width:none] sm:mask-none sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                <FilterChip active={tag === null} onClick={() => setTag(null)}>
                  All
                </FilterChip>
                {available.map((t) => (
                  <FilterChip
                    key={t.key}
                    active={tag === t.key}
                    onClick={() => setTag(tag === t.key ? null : t.key)}
                  >
                    {t.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-8 px-5 pb-4">
            {days.map(([day, group]) => (
              <section key={day}>
                <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <h2 className="text-base font-medium tracking-tight">
                    {dayLabel(group[0].outfit.wornAt ?? group[0].outfit.createdAt)}
                  </h2>
                  {/* Almost every day holds one outfit, so saying "1 outfit" on
                      each heading was noise on every row to inform none. */}
                  {group.length > 1 ? (
                    <span className="shrink-0 font-mono text-[11px] text-muted">
                      {group.length} outfits
                    </span>
                  ) : null}
                </div>

                <ol className="space-y-3">
                  {group.map(({ outfit, pieces, tags, missing }) => (
                    <li key={outfit.id} className="rounded-2xl bg-surface p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {outfit.slot ? TIME_SLOT_LABELS[outfit.slot] : ALL_DAY_LABEL}
                        </span>
                        {/* The occasion is what the outfit was built for; the
                            slot beside it is when it was worn. Different claims,
                            so they don't share a visual weight. */}
                        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                          {OCCASION_LABELS[outfit.occasion]}
                        </span>
                        <span className="sr-only">
                          Tagged {tags.map((t) => t.label).join(", ")}
                        </span>
                      </div>
                      <OutfitCard items={pieces} stagger={false} />
                      {missing > 0 ? (
                        <p className="mt-3 text-sm text-muted">
                          {missing} piece{missing === 1 ? "" : "s"} no longer in your
                          closet.
                        </p>
                      ) : null}
                      {outfit.note ? (
                        <p className="mt-3 text-sm text-muted">{outfit.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            {visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Nothing logged under that tag yet.
              </p>
            ) : null}
          </div>
        </>
      )}
    </main>
  );
}

function FilterChip({
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
