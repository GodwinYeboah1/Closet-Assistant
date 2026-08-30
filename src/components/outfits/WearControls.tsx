"use client";

import { useState } from "react";
import {
  ALL_DAY_LABEL,
  TIME_SLOTS,
  TIME_SLOT_LABELS,
  slotForDate,
  type TimeSlot,
} from "@/lib/types";

/**
 * The logging controls, shared by Today and the Outfits board so both screens
 * behave identically.
 *
 * Most people wear one outfit a day and want one tap, so the slot picker is not
 * on screen until it earns its place: the plain button logs an all-day entry
 * and never asks a question. It opens on its own only after something is
 * already logged for today — the one moment a second entry genuinely needs
 * telling apart from the first — and preselects the slot the clock is in.
 */
export default function WearControls({
  logged,
  slot,
  onSlot,
  onLog,
  onLogAnother,
}: {
  logged: boolean;
  slot: TimeSlot | null;
  onSlot: (value: TimeSlot | null) => void;
  onLog: () => void;
  onLogAnother: () => void;
}) {
  const [picking, setPicking] = useState(false);

  if (logged) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-muted">
          Logged for today{slot ? ` · ${TIME_SLOT_LABELS[slot]}` : ""}.
        </p>
        <button
          type="button"
          onClick={() => {
            onSlot(slotForDate());
            setPicking(true);
            onLogAnother();
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm transition-transform active:scale-95"
        >
          Log another for today
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {picking ? (
        <div className="animate-rise mb-3">
          <h3 className="eyebrow mb-2 text-muted">Time of day</h3>
          <div className="flex flex-wrap gap-2">
            <Chip active={slot === null} onClick={() => onSlot(null)}>
              {ALL_DAY_LABEL}
            </Chip>
            {TIME_SLOTS.map((value) => (
              <Chip
                key={value}
                active={slot === value}
                onClick={() => onSlot(value)}
              >
                {TIME_SLOT_LABELS[value]}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLog}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-transform active:scale-95"
        >
          Wearing this
        </button>
        {picking ? null : (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="inline-flex min-h-11 items-center px-2 text-sm text-muted underline-offset-4 hover:underline"
          >
            Add time of day
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({
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
      className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm transition-colors ${
        active
          ? "border-accent bg-accent font-medium text-on-accent"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
