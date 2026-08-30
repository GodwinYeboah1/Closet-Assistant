"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lastWornLabel } from "@/lib/format";
import { processCapture } from "@/lib/image";
import { deleteItem, markWorn, updateItem } from "@/lib/store";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  COLORS,
  COLOR_SWATCHES,
  OCCASIONS,
  OCCASION_LABELS,
  type ClothingItem,
  type Occasion,
} from "@/lib/types";
import { useItem } from "@/lib/useCloset";
import BackLink from "@/components/ui/BackLink";
import PageHeader from "@/components/ui/PageHeader";
import PhotoPending from "./PhotoPending";

/** Everything about an item is editable after the fact, photo included. */
export default function ItemEditor({ itemId }: { itemId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const item = useItem(itemId);
  const [tagDraft, setTagDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (item === undefined) return null;
  if (item === null) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20">
        <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <h1 className="text-base font-medium">That item is no longer in your closet</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            It may have been deleted from another tab. Outfits you logged with it
            are still in your worn history.
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

  // Every edit writes straight through; the store notifies and this re-renders.
  const patch = (changes: Partial<ClothingItem>) => updateItem(item.id, changes);

  const toggleOccasion = (occasion: Occasion) => {
    patch({
      occasions: item.occasions.includes(occasion)
        ? item.occasions.filter((value) => value !== occasion)
        : [...item.occasions, occasion],
    });
  };

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase();
    if (!tag || item.tags.includes(tag)) return setTagDraft("");
    patch({ tags: [...item.tags, tag] });
    setTagDraft("");
  };

  const replacePhoto = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      patch({ photoUrl: processCapture(img).dataUrl });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <main className="mx-auto max-w-2xl pb-10">
      {/* The item screen was the only one with no heading at all — its name
          lived in a form field and nothing announced the page. It now carries
          the same header as every other screen, and the title tracks the name
          field as you type. */}
      <PageHeader
        title={item.name?.trim() || CATEGORY_LABELS[item.category]}
        subtitle={`${lastWornLabel(item.lastWornAt)} · worn ${item.wearCount}\u00d7`}
        back={<BackLink />}
      />

      <div className="px-5">
      <div className="photo-tile aspect-square rounded-2xl">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={item.name ?? CATEGORY_LABELS[item.category]}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <Link href={`/capture?itemId=${item.id}`} className="block h-full w-full">
            <PhotoPending category={item.category} />
          </Link>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="ml-auto flex flex-wrap gap-2">
          <Link
            href={`/capture?itemId=${item.id}`}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs"
          >
            {item.photoUrl ? "Retake" : "Add photo"}
          </Link>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs"
          >
            Library
          </button>
          <button
            type="button"
            onClick={() => markWorn(item.id)}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-xs font-medium text-canvas transition-transform active:scale-95"
          >
            Worn today
          </button>
        </div>
      </div>

      <Field label="Name">
        <input
          value={item.name ?? ""}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder={CATEGORY_LABELS[item.category]}
          className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-accent"
        />
      </Field>

      <Field label="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((value) => (
            <Toggle
              key={value}
              active={item.category === value}
              onClick={() => patch({ category: value })}
            >
              {CATEGORY_LABELS[value]}
            </Toggle>
          ))}
        </div>
      </Field>

      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={value}
              aria-pressed={item.color === value}
              onClick={() => patch({ color: value })}
              className="grid h-11 w-11 place-items-center transition-transform active:scale-90"
            >
              <span
                className={`h-8 w-8 rounded-full border ${
                  item.color === value ? "border-accent ring-2 ring-accent/50" : "border-line"
                }`}
                style={{ backgroundColor: COLOR_SWATCHES[value] }}
              />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Good for">
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((value) => (
            <Toggle
              key={value}
              active={item.occasions.includes(value)}
              onClick={() => toggleOccasion(value)}
            >
              {OCCASION_LABELS[value]}
            </Toggle>
          ))}
        </div>
      </Field>

      <Field label="Tags">
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => patch({ tags: item.tags.filter((value) => value !== tag) })}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm text-muted"
            >
              {tag} ×
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={tagDraft}
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="linen, gift, needs repair…"
            className="min-h-11 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={addTag}
            className="min-h-11 rounded-xl border border-line px-4 text-sm"
          >
            Add
          </button>
        </div>
      </Field>

      <div className="mt-10 border-t border-line pt-5">
        {confirmingDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Remove this item for good?</span>
            <button
              type="button"
              onClick={() => {
                deleteItem(item.id);
                router.push("/closet");
              }}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-on-accent"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="inline-flex min-h-11 items-center text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline"
          >
            Delete item
          </button>
        )}
      </div>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) replacePhoto(file);
          event.target.value = "";
        }}
      />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="eyebrow mb-2 text-muted">{label}</h2>
      {children}
    </section>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
        active ? "border-accent bg-accent font-medium text-on-accent" : "border-line bg-surface text-muted"
      }`}
    >
      {children}
    </button>
  );
}
