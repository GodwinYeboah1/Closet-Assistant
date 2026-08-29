import Link from "next/link";
import { CATEGORY_LABELS, type ClothingItem } from "@/lib/types";

/** A suggestion is shown as the actual garments, laid out left to right. */
export default function OutfitCard({ items }: { items: ClothingItem[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/closet/${item.id}`}
          style={{ animationDelay: `${index * 45}ms` }}
          className="animate-rise photo-plate aspect-square w-28 shrink-0 overflow-hidden rounded-2xl border border-line sm:w-32"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.photoUrl}
            alt={item.name ?? CATEGORY_LABELS[item.category]}
            className="h-full w-full object-contain p-2.5"
          />
        </Link>
      ))}
    </div>
  );
}
