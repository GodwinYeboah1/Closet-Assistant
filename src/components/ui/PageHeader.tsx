export default function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Rendered above the title — a back affordance on nested screens. */
  back?: React.ReactNode;
}) {
  return (
    <header className={`px-5 pb-5 ${back ? "pt-4" : "pt-8"}`}>
      {back ? <div className="mb-1">{back}</div> : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
