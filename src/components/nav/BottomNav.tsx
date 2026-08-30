"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/closet", label: "Closet" },
  { href: "/outfits", label: "Outfits" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  // The capture screen owns the whole viewport — it has its own close affordance.
  if (pathname === "/capture") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-1 px-3 py-2 sm:px-6">
        {LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-3.5 text-sm transition-colors sm:px-4 ${
                active ? "bg-accent font-medium text-on-accent" : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/capture"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-transform active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l.9-1.6a1 1 0 0 1 .87-.5h5.06a1 1 0 0 1 .87.5l.9 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Add
        </Link>
      </div>
    </nav>
  );
}
