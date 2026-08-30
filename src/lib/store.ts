"use client";

import { TIME_SLOTS, type ClothingItem, type NewClothingItem, type Outfit } from "./types";

/**
 * Placeholder persistence layer.
 *
 * Everything is kept in localStorage so the capture flow is usable with no
 * backend. Keep every read/write behind this module: replacing it with fetch
 * calls to a real API is then a single-file change.
 *
 * Known limit: photos are stored as data URLs, and localStorage caps out around
 * 5MB. See README for the IndexedDB / object-storage follow-up.
 */

const ITEMS_KEY = "closet-assistant:items:v1";
const OUTFITS_KEY = "closet-assistant:outfits:v1";
const SEEDED_KEY = "closet-assistant:seeded:v1";
const SEED_VERSION_KEY = "closet-assistant:seed-version";
const CHANGE_EVENT = "closet-assistant:change";

/**
 * Thrown when a write can't fit in localStorage.
 *
 * The ceiling is around 5MB and photographs are the only thing here big enough
 * to reach it, so this is really "the camera filled the disk". Callers that can
 * add a photo are expected to catch it and say so; everything else is welcome
 * to let it reach the error boundary, which is still better than the silent
 * `QuotaExceededError` that used to blank the screen.
 */
export class StorageFullError extends Error {
  constructor() {
    super("No room left in this device's local storage.");
    this.name = "StorageFullError";
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

/** Cached so `useSyncExternalStore` gets a referentially stable snapshot. */
let itemsCache: ClothingItem[] | null = null;
let outfitsCache: Outfit[] | null = null;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Nothing was written, so the caches still match what's on disk: leave them
    // alone and let the caller decide what to tell the user.
    if (isQuotaError(error)) throw new StorageFullError();
    throw error;
  }
  itemsCache = null;
  outfitsCache = null;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function id() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function getItems(): ClothingItem[] {
  if (!itemsCache) {
    itemsCache = read<ClothingItem>(ITEMS_KEY).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  return itemsCache;
}

export function getItem(itemId: string): ClothingItem | undefined {
  return getItems().find((item) => item.id === itemId);
}

export function addItem(input: NewClothingItem): ClothingItem {
  const item: ClothingItem = {
    ...input,
    id: id(),
    createdAt: new Date().toISOString(),
    lastWornAt: input.lastWornAt ?? null,
    wearCount: input.wearCount ?? 0,
  };
  write(ITEMS_KEY, [item, ...read<ClothingItem>(ITEMS_KEY)]);
  return item;
}

export function updateItem(
  itemId: string,
  patch: Partial<Omit<ClothingItem, "id" | "createdAt">>,
): void {
  write(
    ITEMS_KEY,
    read<ClothingItem>(ITEMS_KEY).map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    ),
  );
}

/**
 * Removes a garment. Outfit history is deliberately left alone.
 *
 * This used to delete every outfit the garment appeared in, which meant getting
 * rid of one shirt could erase most of the log — measured at three entries down
 * to one from a single deletion. What you wore on a day is a fact about that
 * day, and owning the garment later is not part of it. The history view renders
 * whichever pieces survive and says how many are gone.
 */
export function deleteItem(itemId: string): void {
  write(
    ITEMS_KEY,
    read<ClothingItem>(ITEMS_KEY).filter((item) => item.id !== itemId),
  );
}

/** Marks an item worn today — the one write that keeps "last worn" honest. */
export function markWorn(itemId: string, when = new Date()): void {
  const item = getItem(itemId);
  if (!item) return;
  updateItem(itemId, {
    lastWornAt: when.toISOString(),
    wearCount: item.wearCount + 1,
  });
}

/** The moment an outfit stands for, falling back to when it was recorded. */
function outfitTime(outfit: Outfit): string {
  return outfit.wornAt ?? outfit.createdAt;
}

/**
 * Worn/planned outfits: newest day first, then chronological within the day.
 *
 * A day reads forwards — an all-day entry, then morning through night — because
 * that's the order the day happened in, and a day is the unit people scan. Days
 * themselves read backwards, newest first, because that's the unit people
 * arrive looking for. Entries with no slot sort ahead of slotted ones: they
 * stand for the whole day rather than a part of it.
 *
 * Cached for the same reason `getItems` is: `useSyncExternalStore` compares
 * snapshots by reference, so returning a fresh array each call would spin.
 */
export function getOutfits(): Outfit[] {
  if (!outfitsCache) {
    outfitsCache = read<Outfit>(OUTFITS_KEY).sort((a, b) => {
      const dayA = outfitTime(a).slice(0, 10);
      const dayB = outfitTime(b).slice(0, 10);
      if (dayA !== dayB) return dayB.localeCompare(dayA);
      const slotA = a.slot ? TIME_SLOTS.indexOf(a.slot) : -1;
      const slotB = b.slot ? TIME_SLOTS.indexOf(b.slot) : -1;
      if (slotA !== slotB) return slotA - slotB;
      return outfitTime(a).localeCompare(outfitTime(b));
    });
  }
  return outfitsCache;
}

export function saveOutfit(
  input: Omit<Outfit, "id" | "createdAt">,
): Outfit {
  const outfit: Outfit = { ...input, id: id(), createdAt: new Date().toISOString() };
  write(OUTFITS_KEY, [outfit, ...read<Outfit>(OUTFITS_KEY)]);
  return outfit;
}

/**
 * Seeds a first-run closet, and tops up existing ones when new entries ship.
 *
 * Runs at most once per seed version. Demo filler is only topped up while some
 * filler is still present, so clearing the examples keeps them cleared; items
 * the owner asked for are always added if missing. Anything deleted before a
 * version bump can come back once — an acceptable wart for starter data, and
 * the reason the version only moves when entries are actually added.
 */
export function syncSeed(build: () => ClothingItem[], version: number): void {
  if (typeof window === "undefined") return;

  const firstRun = !window.localStorage.getItem(SEEDED_KEY);
  const storedVersion = Number(window.localStorage.getItem(SEED_VERSION_KEY) ?? 0);
  if (!firstRun && storedVersion >= version) return;

  window.localStorage.setItem(SEED_VERSION_KEY, String(version));
  const existing = read<ClothingItem>(ITEMS_KEY);

  if (firstRun) {
    window.localStorage.setItem(SEEDED_KEY, new Date().toISOString());
    if (existing.length === 0) {
      write(ITEMS_KEY, build());
      return;
    }
  }

  const known = new Set(existing.map((item) => item.id));
  const samplesStillPresent = existing.some((item) => item.isSample);
  const additions = build().filter(
    (item) => !known.has(item.id) && (samplesStillPresent || !item.isSample),
  );
  if (additions.length) write(ITEMS_KEY, [...additions, ...existing]);
}

/** Removes every seeded item, leaving anything the user photographed alone. */
export function clearSamples(): void {
  const remaining = read<ClothingItem>(ITEMS_KEY).filter((item) => !item.isSample);
  const removedIds = new Set(
    read<ClothingItem>(ITEMS_KEY)
      .filter((item) => item.isSample)
      .map((item) => item.id),
  );
  write(ITEMS_KEY, remaining);
  write(
    OUTFITS_KEY,
    read<Outfit>(OUTFITS_KEY).filter((fit) => !fit.itemIds.some((id) => removedIds.has(id))),
  );
}

/** Subscribe to any store write, including writes from another tab. */
export function subscribe(listener: () => void): () => void {
  // Another tab's write only reaches us as a `storage` event, so drop the cache
  // here rather than in `write`.
  const onChange = () => {
    itemsCache = null;
    outfitsCache = null;
    listener();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
