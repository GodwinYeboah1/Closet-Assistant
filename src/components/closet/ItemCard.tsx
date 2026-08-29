import Link from "next/link";
import { lastWornLabel } from "@/lib/format";
import { CATEGORY_LABELS, type ClothingItem } from "@/lib/types";

export default function ItemCard({ item }: { item: ClothingItem }) {
  return (
    <Link
      href={`/closet/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card transition-transform active:scale-[0.98]"
    >
      <div className="photo-plate aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photoUrl}
          alt={item.name ?? CATEGORY_LABELS[item.category]}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="border-t border-line px-3 py-2.5">
        <p className="truncate text-sm font-medium">
          {item.name ?? CATEGORY_LABELS[item.category]}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-muted">
          {lastWornLabel(item.lastWornAt)}
        </p>
      </div>
    </Link>
  );
}
