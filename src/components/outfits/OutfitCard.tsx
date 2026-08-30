import Link from "next/link";
import PhotoPending from "@/components/closet/PhotoPending";
import { CATEGORY_LABELS, type ClothingItem } from "@/lib/types";

/**
 * A suggestion is shown as the actual garments.
 *
 * This wraps rather than scrolls: a five-piece outfit in a horizontal scroller
 * showed three tiles under a caption that said five, so the card contradicted
 * itself. Every piece the suggestion claims is visible without interaction.
 *
 * `stagger` is for the single card that is the subject of its screen. In a list
 * every card would restart the cascade from zero, so a ten-entry log fired
 * about fifty staggered entrances in repeating bursts — the log passes false.
 */
export default function OutfitCard({
  items,
  stagger = true,
}: {
  items: ClothingItem[];
  stagger?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      style={{
        // Three across on a phone, where five would be thumbnails. Above that,
        // one column per piece up to five, so a three-piece outfit fills its
        // card instead of leaving two empty columns of dead space.
        ["--cols" as string]: Math.min(items.length, 5),
      }}
    >
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/closet/${item.id}`}
          style={stagger ? { animationDelay: `${index * 45}ms` } : undefined}
          className={`photo-tile aspect-square rounded-xl ${stagger ? "animate-rise" : ""}`}
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
