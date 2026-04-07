import type { PlaceholderDef } from "./templates";

const SCALE = 0.25;
const ALPHA_THRESHOLD = 32;
const MIN_AREA_RATIO = 0.001;
const ROW_TOLERANCE_RATIO = 0.05;

function makeOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") {
    const oc = new OffscreenCanvas(width, height);
    // OffscreenCanvas.getContext returns OffscreenCanvasRenderingContext2D,
    // but we need a regular canvas for getImageData compat — use HTMLCanvasElement instead.
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export async function detectSlots(
  imageUrl: string,
  canvasWidth: number,
  canvasHeight: number,
  expectedCount?: number
): Promise<PlaceholderDef[]> {
  const img = await loadImage(imageUrl);

  const scaledW = Math.max(1, Math.round(canvasWidth * SCALE));
  const scaledH = Math.max(1, Math.round(canvasHeight * SCALE));

  const canvas = makeOffscreenCanvas(scaledW, scaledH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  ctx.drawImage(img, 0, 0, scaledW, scaledH);
  const imageData = ctx.getImageData(0, 0, scaledW, scaledH);

  // Build transparent mask
  const total = scaledW * scaledH;
  const transparent = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    transparent[i] = imageData.data[i * 4 + 3] < ALPHA_THRESHOLD ? 1 : 0;
  }

  // Union-Find
  const parent = new Int32Array(total);
  for (let i = 0; i < total; i++) parent[i] = i;

  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a: number, b: number): void {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  // First pass: label components
  const labels = new Int32Array(total).fill(-1);
  let nextLabel = 0;

  for (let y = 0; y < scaledH; y++) {
    for (let x = 0; x < scaledW; x++) {
      const idx = y * scaledW + x;
      if (!transparent[idx]) continue;

      const upIdx = y > 0 ? (y - 1) * scaledW + x : -1;
      const leftIdx = x > 0 ? y * scaledW + (x - 1) : -1;
      const upLabel = upIdx >= 0 ? labels[upIdx] : -1;
      const leftLabel = leftIdx >= 0 ? labels[leftIdx] : -1;

      if (upLabel === -1 && leftLabel === -1) {
        labels[idx] = nextLabel;
        nextLabel++;
      } else if (upLabel === -1) {
        labels[idx] = leftLabel;
      } else if (leftLabel === -1) {
        labels[idx] = upLabel;
      } else {
        union(upLabel, leftLabel);
        labels[idx] = upLabel;
      }
    }
  }

  // Second pass: resolve labels
  for (let i = 0; i < total; i++) {
    if (labels[i] >= 0) labels[i] = find(labels[i]);
  }

  // Compute bounding boxes
  const bboxes = new Map<
    number,
    { minX: number; minY: number; maxX: number; maxY: number; count: number }
  >();
  for (let y = 0; y < scaledH; y++) {
    for (let x = 0; x < scaledW; x++) {
      const lbl = labels[y * scaledW + x];
      if (lbl < 0) continue;
      const root = find(lbl);
      const bb = bboxes.get(root);
      if (!bb) {
        bboxes.set(root, { minX: x, minY: y, maxX: x, maxY: y, count: 1 });
      } else {
        if (x < bb.minX) bb.minX = x;
        if (y < bb.minY) bb.minY = y;
        if (x > bb.maxX) bb.maxX = x;
        if (y > bb.maxY) bb.maxY = y;
        bb.count++;
      }
    }
  }

  // Filter noise by minimum area
  const minArea = total * MIN_AREA_RATIO;
  const candidates = [...bboxes.values()].filter((bb) => bb.count >= minArea);

  // Scale back to original canvas coordinates
  const invScale = 1 / SCALE;
  const slots: PlaceholderDef[] = candidates.map((bb) => ({
    id: "",
    x: Math.round(bb.minX * invScale),
    y: Math.round(bb.minY * invScale),
    width: Math.round((bb.maxX - bb.minX + 1) * invScale),
    height: Math.round((bb.maxY - bb.minY + 1) * invScale),
    borderRadius: 0,
  }));

  // Sort row-major (top-to-bottom, left-to-right within each row)
  const rowTol = canvasHeight * ROW_TOLERANCE_RATIO;
  slots.sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) <= rowTol) return a.x - b.x;
    return yDiff;
  });

  // Assign sequential IDs
  slots.forEach((s, i) => {
    s.id = `slot_${i + 1}`;
  });

  if (expectedCount !== undefined && slots.length !== expectedCount) {
    console.warn(
      `detectSlots: expected ${expectedCount} slots, found ${slots.length} in ${imageUrl}`
    );
  }

  return slots;
}
