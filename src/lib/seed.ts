import type { ClothingItem, Category, ColorName, Occasion } from "./types";

/**
 * A starter closet of real garment photography, so the catalog, the filters and
 * the outfit suggestions all do something before the user has photographed
 * anything of their own.
 *
 * Photos are hosted by Unsplash and referenced by URL rather than bundled: the
 * `photoUrl` field is meant to hold a remote object-storage URL in production,
 * so the samples exercise the same path a real item will. Unsplash photos are
 * free to use commercially and require no attribution; every image here was
 * reviewed individually before being added. Item names describe what is in the
 * photograph — they are not a claim about who made or owns the garment.
 *
 * Wear history is spread out on purpose: it's what makes "longest unworn"
 * sorting and the rotation-aware ranker visibly do something on first run.
 */

type SampleSpec = {
  name: string;
  category: Category;
  color: ColorName;
  /** Unsplash photo id — the stable part of an images.unsplash.com URL. */
  photo: string;
  occasions: Occasion[];
  tags: string[];
  /** Days since last worn; `null` means never worn. */
  wornDaysAgo: number | null;
  wearCount: number;
};

const SAMPLES: SampleSpec[] = [
  {
    name: "Air Jordan 1",
    category: "shoes",
    color: "red",
    photo: "photo-1552346154-21d32810aba3",
    occasions: ["everyday", "weekend", "date-night"],
    tags: ["leather", "high-top"],
    wornDaysAgo: 3,
    wearCount: 24,
  },
  {
    name: "Black Leather Boots",
    category: "shoes",
    color: "black",
    photo: "photo-1534233812932-59b8fa1b780c",
    occasions: ["work", "interview", "formal", "date-night"],
    tags: ["leather", "resoled 2025"],
    wornDaysAgo: 34,
    wearCount: 9,
  },
  {
    name: "White Running Trainers",
    category: "shoes",
    color: "white",
    photo: "photo-1600185365926-3a2ce3cdb9eb",
    occasions: ["everyday", "active", "weekend"],
    tags: ["mesh", "gym"],
    wornDaysAgo: 9,
    wearCount: 16,
  },
  {
    name: "Black Leather Sneakers",
    category: "shoes",
    color: "black",
    photo: "photo-1543508282-6319a3e2621f",
    occasions: ["everyday", "work", "date-night"],
    tags: ["leather"],
    wornDaysAgo: 52,
    wearCount: 5,
  },
  {
    name: "White Dress Shirt",
    category: "shirt",
    color: "white",
    photo: "photo-1602810316498-ab67cf68c8e1",
    occasions: ["work", "interview", "formal", "date-night"],
    tags: ["cotton", "iron before wearing"],
    wornDaysAgo: 21,
    wearCount: 12,
  },
  {
    name: "White Crewneck Tee",
    category: "shirt",
    color: "white",
    photo: "photo-1651761179569-4ba2aa054997",
    occasions: ["everyday", "weekend", "active"],
    tags: ["cotton"],
    wornDaysAgo: 2,
    wearCount: 31,
  },
  {
    name: "Black Graphic Tee",
    category: "shirt",
    color: "black",
    photo: "photo-1583743814966-8936f5b7be1a",
    occasions: ["everyday", "weekend"],
    tags: ["cotton", "print"],
    wornDaysAgo: 47,
    wearCount: 6,
  },
  {
    name: "White Sweatshirt",
    category: "shirt",
    color: "white",
    photo: "photo-1620799140408-edc6dcb6d633",
    occasions: ["everyday", "weekend", "active"],
    tags: ["fleece-backed"],
    wornDaysAgo: 14,
    wearCount: 19,
  },
  {
    name: "Light Wash Jeans",
    category: "pants",
    color: "blue",
    photo: "photo-1602293589930-45aad59ba3ab",
    occasions: ["everyday", "weekend"],
    tags: ["denim"],
    wornDaysAgo: 4,
    wearCount: 42,
  },
  {
    name: "Black Jeans",
    category: "pants",
    color: "black",
    photo: "photo-1718252540617-6ecda2b56b57",
    occasions: ["everyday", "work", "interview", "date-night"],
    tags: ["denim", "slim"],
    wornDaysAgo: 62,
    wearCount: 7,
  },
  {
    name: "Dark Indigo Jeans",
    category: "pants",
    color: "navy",
    photo: "photo-1624378439575-d8705ad7ae80",
    occasions: ["everyday", "work", "weekend"],
    tags: ["denim", "raw"],
    wornDaysAgo: 16,
    wearCount: 11,
  },
  {
    name: "Rust Trousers",
    category: "pants",
    color: "red",
    photo: "photo-1590159983013-d4ff5fc71c1d",
    occasions: ["weekend", "everyday"],
    tags: ["wide leg"],
    wornDaysAgo: 88,
    wearCount: 3,
  },
  {
    name: "Black Suit Jacket",
    category: "jacket",
    color: "black",
    photo: "photo-1592343516109-362f7bd871aa",
    occasions: ["interview", "work", "formal", "date-night"],
    tags: ["wool", "dry clean"],
    wornDaysAgo: 96,
    wearCount: 4,
  },
  {
    name: "Denim Jacket",
    category: "jacket",
    color: "blue",
    photo: "photo-1611312449408-fcece27cdbb7",
    occasions: ["everyday", "weekend"],
    tags: ["denim", "spring"],
    wornDaysAgo: 12,
    wearCount: 8,
  },
  {
    name: "Black Leather Jacket",
    category: "jacket",
    color: "black",
    photo: "photo-1551028719-00167b16eac5",
    occasions: ["everyday", "weekend", "date-night"],
    tags: ["leather"],
    wornDaysAgo: 41,
    wearCount: 10,
  },
  {
    name: "Brown Leather Belt",
    category: "accessory",
    color: "brown",
    photo: "photo-1624222247344-550fb60583dc",
    occasions: ["everyday", "work", "interview", "formal"],
    tags: ["leather"],
    wornDaysAgo: 21,
    wearCount: 18,
  },
  {
    name: "Two-Tone Watch",
    category: "accessory",
    color: "grey",
    photo: "photo-1639006570490-79c0c53f1080",
    occasions: ["everyday", "work", "interview", "date-night"],
    tags: ["steel", "needs new battery"],
    wornDaysAgo: 1,
    wearCount: 54,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Square, cropped, quality-capped — the shape the catalog grid expects. */
function photoUrl(id: string): string {
  return `https://images.unsplash.com/${id}?w=900&h=900&fit=crop&crop=entropy&q=75&auto=format`;
}

/** Builds the sample closet. Called once, on a first run with an empty store. */
export function buildSampleCloset(now = Date.now()): ClothingItem[] {
  return SAMPLES.map((spec, index) => ({
    id: `sample-${index + 1}`,
    // Staggered so "Newest" ordering is stable and doesn't look machine-made.
    createdAt: new Date(now - index * 37 * 60 * 1000).toISOString(),
    photoUrl: photoUrl(spec.photo),
    name: spec.name,
    category: spec.category,
    color: spec.color,
    tags: spec.tags,
    occasions: spec.occasions,
    lastWornAt:
      spec.wornDaysAgo === null ? null : new Date(now - spec.wornDaysAgo * DAY_MS).toISOString(),
    wearCount: spec.wearCount,
    isSample: true,
  }));
}
