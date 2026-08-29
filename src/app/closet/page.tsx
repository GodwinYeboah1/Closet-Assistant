import type { Metadata } from "next";
import ClosetView from "@/components/closet/ClosetView";

export const metadata: Metadata = { title: "Closet · Closet Assistant" };

export default function ClosetPage() {
  return <ClosetView />;
}
