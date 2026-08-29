import type { Metadata } from "next";
import OutfitBoard from "@/components/outfits/OutfitBoard";

export const metadata: Metadata = { title: "Outfits · Closet Assistant" };

export default function OutfitsPage() {
  return <OutfitBoard />;
}
