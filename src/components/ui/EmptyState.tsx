import Link from "next/link";

export default function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="mx-5 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-transform active:scale-95"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
