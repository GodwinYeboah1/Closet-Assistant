"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Suggestions and the worn log are two views of the same thing, so they get a
 * switch rather than a link buried in a header.
 *
 * They are deliberately not a fourth item in the bottom bar: at a 390px
 * viewport the existing three plus the Add button already measure 312px of the
 * 366px available, and a "Worn" pill pushes that to 374px — it would wrap.
 */
const TABS = [
  { href: "/outfits", label: "Suggestions" },
  { href: "/outfits/history", label: "Worn" },
] as const;

export default function OutfitTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 px-5 pb-5">
      {TABS.map(({ href, label }) => {
        const active =
          href === "/outfits" ? pathname === "/outfits" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
              active
                ? "border-accent bg-accent font-medium text-on-accent"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
