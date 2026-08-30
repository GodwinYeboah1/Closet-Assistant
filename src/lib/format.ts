/** Small formatting helpers shared by the catalog and item detail views. */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The calendar day a timestamp falls on, in the reader's own timezone.
 *
 * Slicing the ISO string instead reads the UTC day, which is a different day
 * for anyone west of Greenwich for part of every evening: an outfit logged at
 * 8pm in New York carries tomorrow's UTC date. The log grouped on that string
 * while labelling with local time, so a night outfit split off into a second
 * section that also called itself "Today". Everything that buckets outfits by
 * day goes through here.
 */
export function localDayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / DAY_MS);
}

export function lastWornLabel(iso: string | null): string {
  const days = daysSince(iso);
  if (days === null) return "Not worn yet";
  if (days <= 0) return "Worn today";
  if (days === 1) return "Worn yesterday";
  if (days < 30) return `Worn ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Worn ${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `Worn ${years} year${years > 1 ? "s" : ""} ago`;
}
