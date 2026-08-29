"use client";

import type { ClothingItem, NewClothingItem, Outfit } from "./types";

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
const CHANGE_EVENT = "closet-assistant:change";

/** Cached so `useSyncExternalStore` gets a referentially stable snapshot. */
let itemsCache: ClothingItem[] | null = null;

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
  window.localStorage.setItem(key, JSON.stringify(value));
  itemsCache = null;
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

export function deleteItem(itemId: string): void {
  write(
    ITEMS_KEY,
    read<ClothingItem>(ITEMS_KEY).filter((item) => item.id !== itemId),
  );
  write(
    OUTFITS_KEY,
    read<Outfit>(OUTFITS_KEY).filter((fit) => !fit.itemIds.includes(itemId)),
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

export function getOutfits(): Outfit[] {
  return read<Outfit>(OUTFITS_KEY);
}

export function saveOutfit(
  input: Omit<Outfit, "id" | "createdAt">,
): Outfit {
  const outfit: Outfit = { ...input, id: id(), createdAt: new Date().toISOString() };
  write(OUTFITS_KEY, [outfit, ...read<Outfit>(OUTFITS_KEY)]);
  return outfit;
}

/** Subscribe to any store write, including writes from another tab. */
export function subscribe(listener: () => void): () => void {
  // Another tab's write only reaches us as a `storage` event, so drop the cache
  // here rather than in `write`.
  const onChange = () => {
    itemsCache = null;
    listener();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
