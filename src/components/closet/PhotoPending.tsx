import { CATEGORY_LABELS, type Category } from "@/lib/types";

/**
 * Stand-in for an item that's catalogued but not yet photographed. Deliberately
 * not a grey box: it reads as an invitation to shoot the thing, because that's
 * the only way it gets a picture. Colours are fixed dark-on-light because the
 * tile plate it sits on is light in both themes.
 */
export default function PhotoPending({
  category,
  compact = false,
}: {
  category: Category;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d5d2cc] text-[#7b7873]">
      <svg width={compact ? 18 : 24} height={compact ? 18 : 24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l.9-1.6a1 1 0 0 1 .87-.5h5.06a1 1 0 0 1 .87.5l.9 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {compact ? null : (
        <span className="eyebrow px-2 text-center leading-tight">
          {CATEGORY_LABELS[category]} · no photo yet
        </span>
      )}
    </div>
  );
}
