import Link from "next/link";
import { lastWornLabel } from "@/lib/format";
import { CATEGORY_LABELS, type ClothingItem } from "@/lib/types";
import PhotoPending from "./PhotoPending";

/**
 * The photograph is the card. No border, no panel — the grid is made of images
 * on a dark ground, with the caption sitting quietly underneath.
 */
export default function ItemCard({ item }: { item: ClothingItem }) {
  return (
    <Link href={`/closet/${item.id}`} className="group block">
      <div className="photo-tile aspect-square rounded-xl">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={item.name ?? CATEGORY_LABELS[item.category]}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <PhotoPending category={item.category} />
        )}
      </div>
      <div className="pt-2">
        <p className="truncate text-[13px] font-medium leading-tight">
          {item.name ?? CATEGORY_LABELS[item.category]}
        </p>
        <p className="mt-1 font-mono text-[11px] leading-none text-muted">
          {lastWornLabel(item.lastWornAt)}
        </p>
      </div>
    </Link>
  );
}
