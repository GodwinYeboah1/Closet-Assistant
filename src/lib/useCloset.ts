"use client";

import { useSyncExternalStore } from "react";
import { getItem, getItems, subscribe } from "./store";
import type { ClothingItem } from "./types";

/** Stable empty snapshot for server render and hydration. */
const EMPTY: ClothingItem[] = [];
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
