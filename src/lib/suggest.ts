import { daysSince } from "./format";
import {
  EMPTY_TASTE,
  hasTaste,
  itemAffinity,
  pairAffinity,
  type TasteProfile,
} from "./taste";
import type { Category, ClothingItem, Occasion } from "./types";

/**
 * Rule-based outfit composer.
 *
 * Only ever combines items already in the user's catalog — nothing is invented
 * or recommended for purchase. This is intentionally deterministic and
 * inspectable; a model-backed ranker can replace `scoreItem` without touching
 * the calling UI.
 *
 * Four things decide a garment's score, and the weights below are the whole
 * design:
 *
 * - **Occasion suitability** dominates everything, deliberately. You cannot
 *   wear the gym shorts to the interview no matter how much you like them, so
 *   the other three terms are jointly bounded to ±45 and can never lift an
 *   untagged garment past a tagged one.
 * - **Taste** — how much this wearer actually likes the garment, learned in
 *   `taste.ts` from what they wore and what they rejected.
 * - **Pairing** — how well it sits with the pieces already picked for this
 *   outfit, from the same learned history.
 * - **Recency** — a short-term brake so today's suggestion isn't yesterday's
 *   shirt, plus a mild nudge toward the back of the wardrobe.
 *
 * That last term is the one that changed. It used to be `score -= wearCount`:
 * an unbounded penalty on the things you wear most, which made the ranker argue
 * with the wearer's own taste and got stronger the longer they used the app.
 * Wearing something often is now evidence *for* it, via the taste profile.
 * What remains here is only the short-term "not two days running" brake, which
 * is a genuinely different concern and the only one recency should own.
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

const OCCASION_WEIGHT = 100;
const TASTE_WEIGHT = 20;
const PAIR_WEIGHT = 15;
const RECENCY_WEIGHT = 10;

/**
 * Short-term wear brake, bounded to ±RECENCY_WEIGHT.
 *
 * Worn in the last couple of days is a real objection; worn three weeks ago is
 * a mild point in its favour. Never worn gets a small nudge rather than the old
 * +40 shove, which used to let a garment the wearer had ignored for a year
 * outrank one they reach for constantly.
 */
function recencyScore(item: ClothingItem): number {
  const days = daysSince(item.lastWornAt);
  if (days === null) return RECENCY_WEIGHT * 0.4;
  if (days <= 2) return -RECENCY_WEIGHT;
  if (days <= 7) return -RECENCY_WEIGHT + ((days - 2) / 5) * RECENCY_WEIGHT;
  return Math.min((days - 7) / 14, 1) * RECENCY_WEIGHT;
}

function scoreItem(
  item: ClothingItem,
  occasion: Occasion,
  taste: TasteProfile,
  chosen: ClothingItem[],
): number {
  let score = item.occasions.includes(occasion) ? OCCASION_WEIGHT : 0;
  score += itemAffinity(taste, item) * TASTE_WEIGHT;
  score += pairAffinity(taste, item.id, chosen) * PAIR_WEIGHT;
  score += recencyScore(item);
  return score;
}

function pick(
  items: ClothingItem[],
  category: Category,
  occasion: Occasion,
  seed: number,
  taste: TasteProfile,
  chosen: ClothingItem[],
  /** Optional layers are only added when the user tagged them for the occasion. */
  requireOccasion = false,
): ClothingItem | undefined {
  const scored = items
    .filter(
      (item) =>
        item.category === category &&
        (!requireOccasion || item.occasions.includes(occasion)),
    )
    .map((item) => ({ item, score: scoreItem(item, occasion, taste, chosen) }))
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0) return undefined;
  /*
   * Rotate through everything scoring near the top so repeat taps keep giving
   * a different answer.
   *
   * This was a hard `seed % min(length, 3)` window, which meant a deep closet
   * still only ever produced three outfits and cycled back to the first on the
   * fourth tap — the "it keeps showing the same outfit" complaint. Banding by
   * score instead lets variety grow with the closet while still refusing to
   * reach for pieces the ranker rates poorly. The band is narrower than it was
   * (20, from 25) now that there is taste to protect: a wide band spends
   * variety by ignoring preferences the wearer has actually expressed.
   */
  const cutoff = scored[0].score - 20;
  const near = scored.filter((entry) => entry.score >= cutoff);
  return near[seed % Math.min(near.length, 8)].item;
}

export function suggestOutfit(
  items: ClothingItem[],
  occasion: Occasion,
  seed = 0,
  taste: TasteProfile = EMPTY_TASTE,
): Suggestion {
  const chosen: ClothingItem[] = [];
  const missing: Category[] = [];

  /*
   * Each layer is picked against the ones already chosen, so pairing evidence
   * compounds down the outfit: once the shirt is settled the trousers are
   * ranked partly on how often they've gone out with it.
   */
  for (const category of REQUIRED) {
    const item = pick(items, category, occasion, seed, taste, chosen);
    if (item) chosen.push(item);
    else missing.push(category);
  }
  for (const category of OPTIONAL) {
    const item = pick(items, category, occasion, seed, taste, chosen, true);
    if (item) chosen.push(item);
  }

  return { occasion, items: chosen, rationale: rationale(chosen, occasion, taste), missing };
}

/**
 * One sentence saying why these pieces, in terms the wearer can check.
 *
 * Every clause here is falsifiable against their own history — "you've worn
 * these together" is either true or it isn't. That is the point: a styling app
 * that says "curated for you" and nothing else is asking for trust it hasn't
 * earned.
 */
function rationale(
  chosen: ClothingItem[],
  occasion: Occasion,
  taste: TasteProfile,
): string {
  if (chosen.length === 0) return "Nothing in the closet fits this yet.";

  const parts: string[] = [];

  const tagged = chosen.filter((item) => item.occasions.includes(occasion)).length;
  if (tagged) parts.push(`${tagged} piece${tagged > 1 ? "s" : ""} you tagged for this`);

  if (hasTaste(taste)) {
    const favourites = chosen.filter((item) => itemAffinity(taste, item) > 0.25).length;
    if (favourites) {
      parts.push(`${favourites} you reach for often`);
    }
    const familiar = chosen.filter(
      (item, index) => index > 0 && pairAffinity(taste, item.id, chosen.slice(0, index)) > 0.3,
    ).length;
    if (familiar) {
      parts.push(`${familiar} you've worn together before`);
    }
  }

  const resting = chosen.filter((item) => {
    const days = daysSince(item.lastWornAt);
    return days === null || days > 21;
  }).length;
  if (resting) parts.push(`${resting} you haven't worn in a while`);

  return parts.length
    ? `Built from ${parts.join(", ")}.`
    : "Built from what's in your closet right now.";
}
