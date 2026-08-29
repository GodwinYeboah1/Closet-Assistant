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
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="text-sm text-muted">That item is no longer in your closet.</p>
        <Link href="/closet" className="mt-4 inline-block text-sm underline underline-offset-4">
          Back to closet
        </Link>
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
    <main className="mx-auto max-w-2xl px-5 pb-10 pt-6">
      <Link href="/closet" className="text-sm text-muted underline-offset-4 hover:underline">
        ← Closet
      </Link>

      <div className="photo-plate mt-4 aspect-square overflow-hidden rounded-3xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photoUrl}
          alt={item.name ?? CATEGORY_LABELS[item.category]}
          className="h-full w-full object-contain p-6"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-xs text-muted">
          {lastWornLabel(item.lastWornAt)} · worn {item.wearCount}×
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-line px-3 py-1.5 text-xs"
          >
            Replace photo
          </button>
          <button
            type="button"
            onClick={() => markWorn(item.id)}
            className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-transform active:scale-95"
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
          className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-clay"
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
              className={`h-8 w-8 rounded-full border transition-transform active:scale-90 ${
                item.color === value ? "border-clay ring-2 ring-clay/40" : "border-line"
              }`}
              style={{ backgroundColor: COLOR_SWATCHES[value] }}
            />
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
              className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-muted"
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
            className="flex-1 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-clay"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-xl border border-line px-4 text-sm"
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
              className="rounded-full bg-clay px-4 py-2 text-sm font-medium text-white"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-sm text-muted underline-offset-4 hover:underline"
          >
            Delete item
          </button>
        )}
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
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{label}</h2>
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
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-clay bg-clay-soft text-clay font-medium" : "border-line bg-card text-muted"
      }`}
    >
      {children}
    </button>
  );
}
