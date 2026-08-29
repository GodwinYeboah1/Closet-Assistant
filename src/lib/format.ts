/** Small formatting helpers shared by the catalog and item detail views. */

const DAY_MS = 24 * 60 * 60 * 1000;

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
