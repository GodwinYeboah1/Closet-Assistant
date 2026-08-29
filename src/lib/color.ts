import { COLORS, COLOR_SWATCHES, type ColorName } from "./types";

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Maps an averaged RGB reading to the closest colour bucket we filter on. */
export function nearestColorName(rgb: [number, number, number]): ColorName {
  let best: ColorName = "multi";
  let bestDistance = Infinity;
  for (const name of COLORS) {
    if (name === "multi") continue;
    const [r, g, b] = hexToRgb(COLOR_SWATCHES[name]);
    const distance = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = name;
    }
  }
  return best;
}
