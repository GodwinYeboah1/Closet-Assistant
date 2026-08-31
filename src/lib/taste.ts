import type { ClothingItem, Outfit, OutfitFeedback } from "./types";

/**
 * What the wearer actually likes, learned from what they wore and what they
 * rejected.
 *
 * The ranker used to score a garment on three things: whether it was tagged for
 * the occasion, how long it had rested, and how often it had been worn — the
 * last of those as a *penalty*. That is a rotation engine. It spreads wear
 * evenly across a closet, which is a reasonable thing to want and the opposite
 * of a taste model: the more you reached for something, the harder the app
 * pushed it away. Meanwhile the outfit log, the one place the wearer's real
 * preferences were written down, was never read by the suggester at all.
 *
 * This module reads it. Three signals go in:
 *
 * - **Worn outfits** are implicit endorsement. You put it on and left the house.
 * - **Likes** are explicit endorsement, worth more than a wear.
 * - **Rejections** ("not this" on a suggestion) are explicit refusal, and worth
 *   more than either, because they are rarer and deliberate.
 *
 * Each signal lands twice: once on the individual garment, once on every pair
 * of garments in the combination. The pair map is the interesting half — it is
 * how the app learns that the tan pants and the cream shirt belong together
 * without anyone ever describing either of them.
 *
 * Everything here is counting. There is no model, no embedding and no network
 * call, which is the point at this stage: every number below can be traced back
 * to a specific thing the wearer did, so when a suggestion looks wrong you can
 * find out why instead of shrugging at it.
 */

/** Weight each kind of evidence carries. */
const WORN = 1;
const LIKED = 2;
const DISLIKED = -3;

/**
 * Raw evidence is unbounded — wear a shirt eighty times and its count is eighty
 * — but a score the ranker adds to a fixed occasion bonus must not be. These
 * push counts through `x / (|x| + k)`, which is smooth, signed, bounded to
 * (-1, 1), and needs repeated evidence to approach either end. `k` is roughly
 * "how much evidence counts as half-convinced".
 */
const K_ITEM = 3;
const K_PAIR = 2;
const K_ATTRIBUTE = 8;

/**
 * A stable key for an unordered pair of garment ids.
 *
 * Lives here rather than in the store because pairing is a taste concept, not a
 * persistence one — the store never needs it, and keeping this module free of
 * store imports leaves it pure and testable without a browser.
 */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function saturate(value: number, k: number): number {
  return value / (Math.abs(value) + k);
}

function bump(map: Map<string, number>, key: string, by: number) {
  map.set(key, (map.get(key) ?? 0) + by);
}

export type TasteProfile = {
  /** Raw signed evidence per garment id. */
  item: Map<string, number>;
  /** Raw signed evidence per unordered pair of garment ids. */
  pair: Map<string, number>;
  /** Evidence generalised to colour, so unworn garments aren't invisible. */
  color: Map<string, number>;
  /** Evidence generalised to free-form tag, same reason. */
  tag: Map<string, number>;
  /** How many judgments went in. Below a handful, nothing here is trustworthy. */
  evidence: number;
};

export const EMPTY_TASTE: TasteProfile = {
  item: new Map(),
  pair: new Map(),
  color: new Map(),
  tag: new Map(),
  evidence: 0,
};

/**
 * Folds the log and the verdict list into a profile.
 *
 * Cheap enough to run on every render of a suggestion — it is a couple of
 * passes over arrays that are, by construction, as long as the wearer's history
 * and no longer. If that ever stops being true, memoise on the store's change
 * event rather than caching here.
 */
export function buildTaste(
  items: ClothingItem[],
  outfits: Outfit[],
  feedback: OutfitFeedback[],
): TasteProfile {
  const taste: TasteProfile = {
    item: new Map(),
    pair: new Map(),
    color: new Map(),
    tag: new Map(),
    evidence: 0,
  };

  const record = (itemIds: string[], weight: number) => {
    taste.evidence += 1;
    for (const id of itemIds) bump(taste.item, id, weight);
    for (let i = 0; i < itemIds.length; i += 1) {
      for (let j = i + 1; j < itemIds.length; j += 1) {
        bump(taste.pair, pairKey(itemIds[i], itemIds[j]), weight);
      }
    }
  };

  // Only outfits actually worn count as endorsement. A planned outfit is an
  // intention, and intentions are not evidence.
  for (const outfit of outfits) {
    if (outfit.wornAt) record(outfit.itemIds, WORN);
  }
  for (const entry of feedback) {
    record(entry.itemIds, entry.verdict === "liked" ? LIKED : DISLIKED);
  }

  /*
   * Generalise to attributes.
   *
   * Without this the profile can only speak about garments it has already seen
   * worn, so a shirt photographed this morning scores zero forever until it is
   * picked by luck. Rolling each garment's evidence up into its colour and its
   * tags means a new navy shirt inherits the case already made for navy, and
   * the ranker has an opinion about it on day one.
   */
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const [id, score] of taste.item) {
    const item = byId.get(id);
    if (!item) continue;
    bump(taste.color, item.color, score);
    for (const tag of item.tags) bump(taste.tag, tag.toLowerCase(), score);
  }

  return taste;
}

/** Affinity for a garment's attributes alone, ignoring the garment itself. */
function attributeAffinity(taste: TasteProfile, item: ClothingItem): number {
  const scores = [saturate(taste.color.get(item.color) ?? 0, K_ATTRIBUTE)];
  for (const tag of item.tags) {
    const raw = taste.tag.get(tag.toLowerCase());
    if (raw !== undefined) scores.push(saturate(raw, K_ATTRIBUTE));
  }
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

/**
 * How much this wearer likes this garment, in -1..1.
 *
 * Direct evidence dominates when it exists; attribute evidence fills in when it
 * doesn't, discounted because an inference from colour is a weaker claim than
 * "you have worn this eleven times".
 */
export function itemAffinity(taste: TasteProfile, item: ClothingItem): number {
  const attribute = attributeAffinity(taste, item);
  const raw = taste.item.get(item.id);
  if (raw === undefined) return attribute * 0.6;
  return saturate(raw, K_ITEM) * 0.7 + attribute * 0.3;
}

/**
 * How well a garment sits with the pieces already chosen, in -1..1.
 *
 * Averaged rather than summed so that a third garment isn't penalised for
 * joining a larger outfit, and so the number stays comparable between a
 * two-piece and a five-piece look.
 */
export function pairAffinity(
  taste: TasteProfile,
  itemId: string,
  chosen: ClothingItem[],
): number {
  if (chosen.length === 0) return 0;
  let total = 0;
  for (const other of chosen) {
    total += saturate(taste.pair.get(pairKey(itemId, other.id)) ?? 0, K_PAIR);
  }
  return total / chosen.length;
}

/**
 * Whether there is enough history for taste to be worth mentioning out loud.
 *
 * The ranker uses the profile from the very first wear — a weak signal still
 * beats no signal — but the UI should not claim to have learned anything about
 * someone until it plausibly has.
 */
export function hasTaste(taste: TasteProfile): boolean {
  return taste.evidence >= 3;
}
