import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
        <h1 className="text-base font-medium">That page isn&apos;t here</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          The link may be out of date, or the item it pointed at has been removed
          from your closet.
        </p>
        <Link
          href="/closet"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-canvas transition-transform active:scale-95"
        >
          Go to closet
        </Link>
      </div>
    </main>
  );
}
