import type { Metadata } from "next";
import CameraCapture from "@/components/camera/CameraCapture";

export const metadata: Metadata = { title: "Add an item · Closet Assistant" };

export default function CapturePage() {
  return <CameraCapture />;
}
