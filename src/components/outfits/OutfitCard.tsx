import Link from "next/link";
import PhotoPending from "@/components/closet/PhotoPending";
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
          className="animate-rise photo-tile aspect-square w-28 shrink-0 rounded-xl sm:w-32"
        >
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photoUrl}
              alt={item.name ?? CATEGORY_LABELS[item.category]}
              loading="lazy"
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <PhotoPending category={item.category} compact />
          )}
        </Link>
      ))}
    </div>
  );
}
