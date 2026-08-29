import { daysSince } from "./format";
import type { Category, ClothingItem, Occasion } from "./types";

/**
 * Rule-based outfit composer.
 *
 * Only ever combines items already in the user's catalog — nothing is invented
 * or recommended for purchase. Scoring favours items marked suitable for the
 * requested occasion and items that haven't been worn recently, which is the
 * behaviour reviewers of existing apps ask for: help me rotate what I own.
 *
 * This is intentionally deterministic and inspectable. A model-backed ranker can
 * replace `scoreItem` without touching the calling UI.
 */

export type Suggestion = {
  occasion: Occasion;
  items: ClothingItem[];
  /** Plain-language reason shown under the suggestion. */
  rationale: string;
  /** Categories we wanted but the closet couldn't fill. */
  missing: Category[];
};

/** Layers a suggestion tries to fill, in order. Jacket is optional. */
const REQUIRED: Category[] = ["shirt", "pants", "shoes"];
const OPTIONAL: Category[] = ["jacket", "accessory"];

function scoreItem(item: ClothingItem, occasion: Occasion): number {
  let score = item.occasions.includes(occasion) ? 100 : 0;
  const days = daysSince(item.lastWornAt);
  // Never worn, or worn long ago, ranks higher — surface the forgotten shelf.
  score += days === null ? 40 : Math.min(days, 60) / 2;
  // Gently discourage the same few items being restyled over and over.
  score -= Math.min(item.wearCount, 20);
  return score;
}

function pick(
  items: ClothingItem[],
  category: Category,
  occasion: Occasion,
  seed: number,
  /** Optional layers are only added when the user tagged them for the occasion. */
  requireOccasion = false,
): ClothingItem | undefined {
  const candidates = items
    .filter(
      (item) =>
        item.category === category &&
        (!requireOccasion || item.occasions.includes(occasion)),
    )
    .sort((a, b) => scoreItem(b, occasion) - scoreItem(a, occasion));
  if (candidates.length === 0) return undefined;
  // Rotate through the top of the list so repeat taps don't return one answer.
  return candidates[seed % Math.min(candidates.length, 3)];
}

export function suggestOutfit(
  items: ClothingItem[],
  occasion: Occasion,
  seed = 0,
): Suggestion {
  const chosen: ClothingItem[] = [];
  const missing: Category[] = [];

  for (const category of REQUIRED) {
    const item = pick(items, category, occasion, seed);
    if (item) chosen.push(item);
    else missing.push(category);
  }
  for (const category of OPTIONAL) {
    const item = pick(items, category, occasion, seed, true);
    if (item) chosen.push(item);
  }

  const tagged = chosen.filter((item) => item.occasions.includes(occasion)).length;
  const resting = chosen.filter((item) => {
    const days = daysSince(item.lastWornAt);
    return days === null || days > 21;
  });

  const parts: string[] = [];
  if (tagged) parts.push(`${tagged} piece${tagged > 1 ? "s" : ""} you tagged for this`);
  if (resting.length) parts.push(`${resting.length} you haven't worn in a while`);
  const rationale = parts.length
    ? `Built from ${parts.join(", and ")}.`
    : "Built from what's in your closet right now.";

  return { occasion, items: chosen, rationale, missing };
}
