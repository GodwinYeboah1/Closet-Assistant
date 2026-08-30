/**
 * Placeholder data models for Closet Assistant.
 *
 * These live in the browser (localStorage) for the initial scaffold. The shapes
 * are deliberately close to what a real table/collection would look like so the
 * swap to a database + object storage is a repository change, not a rewrite.
 */

export const CATEGORIES = [
  "shoes",
  "shirt",
  "pants",
  "jacket",
  "accessory",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  shoes: "Shoes",
  shirt: "Shirt",
  pants: "Pants",
  jacket: "Jacket",
  accessory: "Accessory",
};

/** Coarse color buckets — enough to filter a closet, few enough to tap through. */
export const COLORS = [
  "black",
  "white",
  "grey",
  "navy",
  "blue",
  "green",
  "brown",
  "tan",
  "red",
  "pink",
  "yellow",
  "purple",
  "multi",
] as const;

export type ColorName = (typeof COLORS)[number];

/** Hex swatches used for the color filter chips only — not the item's real color. */
export const COLOR_SWATCHES: Record<ColorName, string> = {
  black: "#1A1A1A",
  white: "#F2F2EF",
  grey: "#9A9A95",
  navy: "#2A3550",
  blue: "#3E6EA8",
  green: "#4F6B4A",
  brown: "#6B4F3A",
  tan: "#C4A882",
  red: "#A8433A",
  pink: "#D08C96",
  yellow: "#D9B44A",
  purple: "#6B5480",
  multi: "#8C8C8C",
};

/** Occasions an outfit can be requested for. Items carry suitability for these. */
export const OCCASIONS = [
  "everyday",
  "work",
  "interview",
  "date-night",
  "weekend",
  "formal",
  "active",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export const OCCASION_LABELS: Record<Occasion, string> = {
  everyday: "Everyday",
  work: "Work",
  interview: "Job interview",
  "date-night": "Date night",
  weekend: "Casual weekend",
  formal: "Formal",
  active: "Active",
};

/**
 * Optional time-of-day slot for a logged outfit.
 *
 * Absent is the ordinary case and means "what I wore that day" — logging a
 * single outfit must never require picking a slot. Slots exist for the days you
 * actually changed: a work fit at 9am and a different one that night. Because
 * the field is optional, every outfit logged before slots existed stays valid
 * and reads as an all-day entry.
 */
export const TIME_SLOTS = ["morning", "midday", "evening", "night"] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Morning",
  midday: "Midday",
  evening: "Evening",
  night: "Night",
};

/** What an entry with no slot is called wherever a label is needed. */
export const ALL_DAY_LABEL = "All day";

/**
 * The slot a given moment falls in. Used only to preselect a sensible default
 * when logging a second outfit for the same day — never to overwrite a choice.
 */
export function slotForDate(date = new Date()): TimeSlot {
  const hour = date.getHours();
  if (hour < 11) return "morning";
  if (hour < 17) return "midday";
  if (hour < 21) return "evening";
  return "night";
}

export type ClothingItem = {
  id: string;
  /**
   * Data URL for the scaffold; an object-storage URL once a backend exists.
   * `null` means the item is catalogued but not yet photographed — you can log
   * something you own now and shoot it later.
   */
  photoUrl: string | null;
  category: Category;
  color: ColorName;
  /** Free-form user tags: "linen", "work shoes", "gift from mum". */
  tags: string[];
  /** Occasions this item reads well for. Drives suggestions. */
  occasions: Occasion[];
  name?: string;
  /** ISO date string, or null if never worn. */
  lastWornAt: string | null;
  wearCount: number;
  createdAt: string;
  /** Seeded demo item. Lets the user wipe the examples without touching real ones. */
  isSample?: boolean;
};

export type Outfit = {
  id: string;
  /** Item ids, in layering order (bottom to top). */
  itemIds: string[];
  occasion: Occasion;
  /**
   * Which part of the day this was worn for. Optional on purpose: `undefined`
   * means the entry stands for the whole day, which is what every outfit logged
   * before this field existed means too.
   */
  slot?: TimeSlot;
  note?: string;
  /** ISO date the outfit is planned for or was worn. */
  wornAt: string | null;
  createdAt: string;
};

export type NewClothingItem = Omit<
  ClothingItem,
  "id" | "createdAt" | "lastWornAt" | "wearCount"
> &
  Partial<Pick<ClothingItem, "lastWornAt" | "wearCount">>;
