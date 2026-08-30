import type { Metadata } from "next";
import CameraCapture from "@/components/camera/CameraCapture";

export const metadata: Metadata = { title: "Add an item · Closet Assistant" };

/**
 * `?itemId=` switches the camera into attach mode: the shot is saved onto an
 * existing catalogued item instead of creating a new one.
 */
export default async function CapturePage({ searchParams }: PageProps<"/capture">) {
  const { itemId } = await searchParams;
  return <CameraCapture attachToId={typeof itemId === "string" ? itemId : undefined} />;
}
