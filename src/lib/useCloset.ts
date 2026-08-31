"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getFeedback, getItem, getItems, getOutfits, subscribe } from "./store";
import { buildTaste, type TasteProfile } from "./taste";
import type { ClothingItem, Outfit, OutfitFeedback } from "./types";

/** Stable empty snapshots for server render and hydration. */
const EMPTY: ClothingItem[] = [];
const EMPTY_OUTFITS: Outfit[] = [];
const EMPTY_FEEDBACK: OutfitFeedback[] = [];
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

/** Every explicit verdict, newest first. */
export function useFeedback() {
  const feedback = useSyncExternalStore(subscribe, getFeedback, () => EMPTY_FEEDBACK);
  return { feedback, ready: useHydrated() };
}

/**
 * The learned taste profile, rebuilt whenever anything it reads from changes.
 *
 * Deliberately derived rather than stored. Preferences computed from the log
 * can never drift out of sync with the log, and deleting a garment or clearing
 * the samples takes its influence with it for free — a stored score would have
 * to be migrated on every one of those, and would be wrong in between.
 */
export function useTaste(): TasteProfile {
  const { items } = useCloset();
  const { outfits } = useOutfits();
  const { feedback } = useFeedback();
  return useMemo(
    () => buildTaste(items, outfits, feedback),
    [items, outfits, feedback],
  );
}
