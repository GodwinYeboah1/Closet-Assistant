import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/nav/BottomNav";
import SeedSamples from "@/components/samples/SeedSamples";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Closet Assistant",
  description:
    "Catalog the clothes you own and get outfit suggestions built only from your own wardrobe.",
  // Add-to-Home-Screen chrome on iOS/Android; harmless in a normal browser tab.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Closet",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d0e10",
  // Capture is full-bleed; cover keeps it out from under the notch / home bar.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SeedSamples />
        <div className="flex-1 pb-28">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
