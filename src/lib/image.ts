/**
 * Client-side photo clean-up for captured items.
 *
 * Goal: catalog tiles that look consistent without shipping an ML model. The
 * approach is a flood fill inwards from the frame edges — anything reachable
 * from the border within a colour tolerance is treated as background, made
 * transparent, and the remaining subject is cropped to a padded square.
 *
 * It is deliberately conservative: if the result looks implausible (almost
 * nothing removed, or almost everything removed) we fall back to a plain centre
 * crop and report `backgroundRemoved: false`, so a busy background never eats
 * the garment. Swap `processCapture` for a real segmentation model later — the
 * signature is the seam.
 */

export type ProcessedCapture = {
  /** PNG data URL, square, subject centred. */
  dataUrl: string;
  backgroundRemoved: boolean;
  cropped: boolean;
};

const MAX_EDGE = 1024;
const OUTPUT_SIZE = 900;

/**
 * Tiles are encoded as WebP, not PNG.
 *
 * These are photographs. A lossless 900x900 PNG of one runs roughly 0.8-2MB
 * once it is a base64 data URL, and localStorage stops at about 5MB — so a
 * catalogue used to hit the ceiling and throw after three or four items. WebP
 * keeps the alpha channel that the background removal produces, which JPEG
 * cannot, at around a tenth of the bytes.
 */
const OUTPUT_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.82;

/** Encodes to WebP, falling back to PNG where a browser refuses the type. */
function encode(canvas: HTMLCanvasElement): string {
  const url = canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY);
  // A canvas that doesn't know the type silently hands back a PNG instead.
  return url.startsWith(`data:${OUTPUT_TYPE}`) ? url : canvas.toDataURL("image/png");
}
/** Squared RGB distance under which a pixel counts as "the same" as the border. */
const TOLERANCE = 42 * 42 * 3;
const PADDING = 0.06;

type Source = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

function sourceSize(source: Source): { width: number; height: number } {
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  if (source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

function drawScaled(source: Source): HTMLCanvasElement {
  const { width, height } = sourceSize(source);
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Flood fill from every border pixel; returns a 1-byte-per-pixel background mask.
 *  Exported (with the geometry helpers below) so the pixel logic can be tested
 *  without a DOM. */
export function backgroundMask(data: Uint8ClampedArray, w: number, h: number) {
  const mask = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  let removed = 0;

  const push = (index: number) => {
    if (mask[index]) return;
    mask[index] = 1;
    removed++;
    queue[tail++] = index;
  };

  const matches = (a: number, b: number) => {
    const dr = data[a * 4] - data[b * 4];
    const dg = data[a * 4 + 1] - data[b * 4 + 1];
    const db = data[a * 4 + 2] - data[b * 4 + 2];
    return dr * dr + dg * dg + db * db <= TOLERANCE;
  };

  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % w;
    const y = (index / w) | 0;
    if (x > 0 && !mask[index - 1] && matches(index, index - 1)) push(index - 1);
    if (x < w - 1 && !mask[index + 1] && matches(index, index + 1)) push(index + 1);
    if (y > 0 && !mask[index - w] && matches(index, index - w)) push(index - w);
    if (y < h - 1 && !mask[index + w] && matches(index, index + w)) push(index + w);
  }

  return { mask, coverage: removed / (w * h) };
}

export function subjectBounds(mask: Uint8Array, w: number, h: number) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/** Square crop box around the subject, padded and clamped to the frame. */
export function squareBox(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  w: number,
  h: number,
) {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const size = Math.min(Math.max(span * (1 + PADDING * 2), 64), Math.min(w, h));
  const half = size / 2;
  return {
    x: Math.round(Math.min(Math.max(cx - half, 0), w - size)),
    y: Math.round(Math.min(Math.max(cy - half, 0), h - size)),
    size: Math.round(size),
  };
}

function centreCrop(canvas: HTMLCanvasElement): string {
  const size = Math.min(canvas.width, canvas.height);
  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  out
    .getContext("2d")
    ?.drawImage(
      canvas,
      (canvas.width - size) / 2,
      (canvas.height - size) / 2,
      size,
      size,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );
  return encode(out);
}

export function processCapture(source: Source): ProcessedCapture {
  const canvas = drawScaled(source);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { dataUrl: centreCrop(canvas), backgroundRemoved: false, cropped: false };

  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { mask, coverage } = backgroundMask(frame.data, canvas.width, canvas.height);

  // Too little removed: busy background. Too much: the garment matched the
  // backdrop. Either way, don't guess — keep the honest photo.
  if (coverage < 0.12 || coverage > 0.94) {
    return { dataUrl: centreCrop(canvas), backgroundRemoved: false, cropped: false };
  }

  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) frame.data[i * 4 + 3] = 0;
  }
  ctx.putImageData(frame, 0, 0);

  const bounds = subjectBounds(mask, canvas.width, canvas.height);
  if (!bounds) {
    return { dataUrl: centreCrop(canvas), backgroundRemoved: false, cropped: false };
  }

  const box = squareBox(bounds, canvas.width, canvas.height);
  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  out
    .getContext("2d")
    ?.drawImage(canvas, box.x, box.y, box.size, box.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return { dataUrl: encode(out), backgroundRemoved: true, cropped: true };
}

/** Rough dominant-colour read used to pre-select the colour chip after capture. */
export function dominantColor(dataUrl: string): Promise<[number, number, number] | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, 48, 48);
      const { data } = ctx.getImageData(0, 0, 48, 48);
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) continue; // skip knocked-out background
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
      resolve(n ? [r / n, g / n, b / n] : null);
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
