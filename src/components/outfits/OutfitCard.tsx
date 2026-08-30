import Link from "next/link";
import PhotoPending from "@/components/closet/PhotoPending";
import { CATEGORY_LABELS, type ClothingItem } from "@/lib/types";

/**
 * A suggestion is shown as the actual garments.
 *
 * This wraps rather than scrolls: a five-piece outfit in a horizontal scroller
 * showed three tiles under a caption that said five, so the card contradicted
 * itself. Every piece the suggestion claims is visible without interaction.
 */
export default function OutfitCard({ items }: { items: ClothingItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/closet/${item.id}`}
          style={{ animationDelay: `${index * 45}ms` }}
          className="animate-rise photo-tile aspect-square rounded-xl"
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
