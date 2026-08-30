import type { Metadata } from "next";
import OutfitHistory from "@/components/outfits/OutfitHistory";

export const metadata: Metadata = { title: "Worn · Closet Assistant" };

export default function OutfitHistoryPage() {
  return <OutfitHistory />;
}
