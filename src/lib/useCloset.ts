"use client";

import { useSyncExternalStore } from "react";
import { getItem, getItems, getOutfits, subscribe } from "./store";
import type { ClothingItem, Outfit } from "./types";

/** Stable empty snapshots for server render and hydration. */
const EMPTY: ClothingItem[] = [];
const EMPTY_OUTFITS: Outfit[] = [];
const noopSubscribe = () => () => {};

/** True only after hydration, so an empty catalog doesn't flash on first paint. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** The whole catalog, re-read on every store write (including from another tab). */
export function useCloset() {
  const items = useSyncExternalStore(subscribe, getItems, () => EMPTY);
  return { items, ready: useHydrated() };
}

/** A single item. `undefined` while hydrating, `null` once we know it's gone. */
export function useItem(itemId: string): ClothingItem | null | undefined {
  const ready = useHydrated();
  const item = useSyncExternalStore(
    subscribe,
    () => getItem(itemId),
    () => undefined,
  );
  if (!ready) return undefined;
  return item ?? null;
}

/** Every outfit logged or planned, newest first. */
export function useOutfits() {
  const outfits = useSyncExternalStore(subscribe, getOutfits, () => EMPTY_OUTFITS);
  return { outfits, ready: useHydrated() };
}
