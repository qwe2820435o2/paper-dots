export type FilterTag = "basic" | "vintage" | "creative" | "fun";

export interface DistortionFn {
  (srcData: Uint8ClampedArray, dstData: Uint8ClampedArray, w: number, h: number): void;
}

export interface FilterDef {
  id: string;
  name: string;
  tags: FilterTag[];
  cssFilter: string;
  canvasEffect?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  /** Real-time pixel coordinate remapping for distortion effects */
  distortion?: DistortionFn;
  /** Stateful particle overlay effect that requires face detection */
  particleOverlay?: string;
}

// --------------- Canvas effect helpers ---------------

function addFilmGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity = 40
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * intensity * 2;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
}

function addSparkles(ctx: CanvasRenderingContext2D, w: number, h: number, count = 60) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 2 + 0.5;
    const alpha = Math.random() * 0.7 + 0.3;
    const hue = Math.random() * 40 + 300;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 90%)`;
    ctx.fill();
    ctx.restore();
  }
}

/** Radial vignette: dark edges fading to transparent center */
function addVignetteOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength = 0.65
) {
  const cx = w / 2;
  const cy = h / 2;
  const diagonal = Math.sqrt(w * w + h * h);
  const inner = diagonal * 0.35;
  const outer = diagonal * 0.75;
  const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Bloom glow: extract highlights and blend blurred version back with screen mode */
function addBloomGlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const threshold = 210;
  const blurPx = 8;
  const strength = 0.45;

  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  const maskData = ctx.createImageData(w, h);
  const m = maskData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum > threshold) {
      m[i] = d[i];
      m[i + 1] = d[i + 1];
      m[i + 2] = d[i + 2];
      m[i + 3] = Math.min(255, Math.round(((lum - threshold) / (255 - threshold)) * 255));
    }
  }

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const offCtx = off.getContext("2d")!;
  offCtx.putImageData(maskData, 0, 0);

  ctx.save();
  ctx.filter = `blur(${blurPx}px)`;
  ctx.globalAlpha = strength;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(off, 0, 0);
  ctx.restore();
}

/** Pencil sketch using grayscale + invert + blur + Color Dodge blend */
function applyPencilSketch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const src = ctx.getImageData(0, 0, w, h);
  const d = src.data;

  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
  }

  // Build inverted grayscale on offscreen canvas, then blur it
  const invCanvas = document.createElement("canvas");
  invCanvas.width = w;
  invCanvas.height = h;
  const invCtx = invCanvas.getContext("2d")!;
  const invData = invCtx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = 255 - gray[i];
    invData.data[i * 4] = invData.data[i * 4 + 1] = invData.data[i * 4 + 2] = v;
    invData.data[i * 4 + 3] = 255;
  }
  invCtx.putImageData(invData, 0, 0);

  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = w;
  blurCanvas.height = h;
  const blurCtx = blurCanvas.getContext("2d")!;
  blurCtx.filter = "blur(8px)";
  blurCtx.drawImage(invCanvas, 0, 0);
  const blurred = blurCtx.getImageData(0, 0, w, h).data;

  // Color Dodge: base / (1 - blend)
  const out = ctx.createImageData(w, h);
  const o = out.data;
  for (let i = 0; i < w * h; i++) {
    const g = gray[i];
    const b = blurred[i * 4];
    const val = b >= 255 ? 255 : Math.min(255, Math.round((g * 255) / (255 - b)));
    o[i * 4] = o[i * 4 + 1] = o[i * 4 + 2] = val;
    o[i * 4 + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
}

/**
 * Kuwahara filter: for each pixel pick the quadrant with minimum luminance
 * variance and use its mean color. Produces an oil-painting brush stroke effect.
 * radius=3 → each quadrant is 4×4; real-time preview runs at ~10fps on 640×480.
 */
function applyKuwahara(ctx: CanvasRenderingContext2D, w: number, h: number, radius = 3) {
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const o = out.data;
  const size = radius + 1;

  // Quadrant top-left corner offsets relative to current pixel
  const quadOffsets: [number, number][] = [
    [-radius, -radius],
    [0, -radius],
    [-radius, 0],
    [0, 0],
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let bestR = 0, bestG = 0, bestB = 0;
      let bestVar = Infinity;

      for (const [qx, qy] of quadOffsets) {
        let sumR = 0, sumG = 0, sumB = 0, sumLum = 0, sumLum2 = 0;
        const count = size * size;

        for (let dy = qy; dy < qy + size; dy++) {
          for (let dx = qx; dx < qx + size; dx++) {
            const px = Math.max(0, Math.min(w - 1, x + dx));
            const py = Math.max(0, Math.min(h - 1, y + dy));
            const idx = (py * w + px) * 4;
            const r = s[idx], g = s[idx + 1], b = s[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            sumR += r; sumG += g; sumB += b;
            sumLum += lum; sumLum2 += lum * lum;
          }
        }

        const meanLum = sumLum / count;
        const variance = sumLum2 / count - meanLum * meanLum;

        if (variance < bestVar) {
          bestVar = variance;
          bestR = sumR / count;
          bestG = sumG / count;
          bestB = sumB / count;
        }
      }

      const idx = (y * w + x) * 4;
      o[idx] = Math.round(bestR);
      o[idx + 1] = Math.round(bestG);
      o[idx + 2] = Math.round(bestB);
      o[idx + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
}

/**
 * Duotone: map each pixel's luminance to a gradient between two colors.
 * shadow → #1a0533 (deep purple), highlight → #f4a261 (rose gold)
 */
function applyDuotone(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  // Shadow color (dark) and highlight color (light)
  const sr = 0x1a, sg = 0x05, sb = 0x33;
  const hr = 0xf4, hg = 0xa2, hb = 0x61;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    d[i]     = Math.round(sr + (hr - sr) * lum);
    d[i + 1] = Math.round(sg + (hg - sg) * lum);
    d[i + 2] = Math.round(sb + (hb - sb) * lum);
  }
  ctx.putImageData(imageData, 0, 0);
}

/** Glitch: RGB channel horizontal shift + random horizontal slice offsets */
function applyGlitch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const o = out.data;

  // Per-channel horizontal shift amounts (pixels)
  const rShift = 4;
  const bShift = -4;

  // Generate a few random horizontal glitch bands
  const bandCount = 6;
  const bands: { y: number; height: number; shift: number }[] = [];
  for (let i = 0; i < bandCount; i++) {
    bands.push({
      y: Math.floor(Math.random() * h),
      height: Math.floor(Math.random() * 12) + 2,
      shift: (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 14) + 4),
    });
  }

  for (let y = 0; y < h; y++) {
    // Find band shift for this row
    let bandShift = 0;
    for (const b of bands) {
      if (y >= b.y && y < b.y + b.height) {
        bandShift = b.shift;
        break;
      }
    }

    for (let x = 0; x < w; x++) {
      const di = (y * w + x) * 4;

      const rSrc = Math.max(0, Math.min(w - 1, x + rShift + bandShift));
      const gSrc = Math.max(0, Math.min(w - 1, x + bandShift));
      const bSrc = Math.max(0, Math.min(w - 1, x + bShift + bandShift));

      o[di]     = s[(y * w + rSrc) * 4];
      o[di + 1] = s[(y * w + gSrc) * 4 + 1];
      o[di + 2] = s[(y * w + bSrc) * 4 + 2];
      o[di + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
}

/** Light leak: warm radial gradients at corners blended with screen mode */
function applyLightLeak(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const leaks = [
    { cx: 0,  cy: 0,  r: w * 0.7, color: "rgba(255,160,60,0.45)" },
    { cx: w,  cy: h,  r: w * 0.6, color: "rgba(255,100,30,0.35)" },
    { cx: w,  cy: 0,  r: w * 0.45, color: "rgba(255,200,80,0.25)" },
  ];
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const lk of leaks) {
    const grad = ctx.createRadialGradient(lk.cx, lk.cy, 0, lk.cx, lk.cy, lk.r);
    grad.addColorStop(0, lk.color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

/** Prism: split RGB channels and shift each slightly to create rainbow fringing */
function applyPrism(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const o = out.data;

  // Shift amounts per channel (dx, dy)
  const shifts: [number, number][] = [
    [-3, -1],  // R shifts left-up
    [0,   0],  // G stays
    [3,   1],  // B shifts right-down
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const di = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const sx = Math.max(0, Math.min(w - 1, x + shifts[c][0]));
        const sy = Math.max(0, Math.min(h - 1, y + shifts[c][1]));
        o[di + c] = s[(sy * w + sx) * 4 + c];
      }
      o[di + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
}

/**
 * Watercolor: heavy blur for soft wash + Sobel edge overlay to restore
 * outlines + slight desaturation. Two offscreen canvases, no pixel-level blur.
 */
function applyWatercolor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Step 1: desaturate slightly
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const t = 0.35;
    d[i]     = Math.round(d[i]     * (1 - t) + lum * t);
    d[i + 1] = Math.round(d[i + 1] * (1 - t) + lum * t);
    d[i + 2] = Math.round(d[i + 2] * (1 - t) + lum * t);
  }
  ctx.putImageData(imageData, 0, 0);

  // Step 2: blurred wash layer (heavy blur via offscreen canvas)
  const washCanvas = document.createElement("canvas");
  washCanvas.width = w;
  washCanvas.height = h;
  const washCtx = washCanvas.getContext("2d")!;
  washCtx.filter = "blur(5px)";
  washCtx.drawImage(ctx.canvas, 0, 0);

  // Step 3: blend wash back with soft-light to smooth colors
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.globalCompositeOperation = "soft-light";
  ctx.drawImage(washCanvas, 0, 0);
  ctx.restore();

  // Step 4: extract edges from original (Sobel on grayscale)
  const src2 = ctx.getImageData(0, 0, w, h);
  const s = src2.data;
  const edgeData = ctx.createImageData(w, h);
  const e = edgeData.data;
  const kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky2 = -1; ky2 <= 1; ky2++) {
        for (let kx2 = -1; kx2 <= 1; kx2++) {
          const idx = ((y + ky2) * w + (x + kx2)) * 4;
          const gray = 0.299 * s[idx] + 0.587 * s[idx + 1] + 0.114 * s[idx + 2];
          const ki = (ky2 + 1) * 3 + (kx2 + 1);
          gx += gray * kx[ki];
          gy += gray * ky[ki];
        }
      }
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const i = (y * w + x) * 4;
      e[i] = e[i + 1] = e[i + 2] = mag > 30 ? Math.round(mag * 0.6) : 0;
      e[i + 3] = e[i] > 0 ? 180 : 0;
    }
  }

  // Step 5: overlay edges with multiply to darken outlines
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = w;
  edgeCanvas.height = h;
  edgeCanvas.getContext("2d")!.putImageData(edgeData, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(edgeCanvas, 0, 0);
  ctx.restore();
}

// --------------- Distortion helpers ---------------

function sampleBilinear(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  sx: number,
  sy: number,
  dstIdx: number,
  dst: Uint8ClampedArray
) {
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const fx = sx - x0;
  const fy = sy - y0;
  const cx = 1 - fx;
  const cy = 1 - fy;

  const i00 = (Math.max(0, Math.min(y0, h - 1)) * w + Math.max(0, Math.min(x0, w - 1))) * 4;
  const i10 = (Math.max(0, Math.min(y0, h - 1)) * w + Math.max(0, Math.min(x1, w - 1))) * 4;
  const i01 = (Math.max(0, Math.min(y1, h - 1)) * w + Math.max(0, Math.min(x0, w - 1))) * 4;
  const i11 = (Math.max(0, Math.min(y1, h - 1)) * w + Math.max(0, Math.min(x1, w - 1))) * 4;

  for (let c = 0; c < 4; c++) {
    dst[dstIdx + c] = Math.round(
      src[i00 + c] * cx * cy +
      src[i10 + c] * fx * cy +
      src[i01 + c] * cx * fy +
      src[i11 + c] * fx * fy
    );
  }
}

/** Center bulge: power < 1 magnifies center */
function makeBulge(power: number): DistortionFn {
  return (src, dst, w, h) => {
    const cx = w / 2, cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x - cx) / maxR;
        const ny = (y - cy) / maxR;
        const r = Math.sqrt(nx * nx + ny * ny);
        const nr = r === 0 ? 0 : Math.pow(r, power);
        const scale = r === 0 ? 0 : nr / r;
        const sx = nx * scale * maxR + cx;
        const sy = ny * scale * maxR + cy;
        sampleBilinear(src, w, h, sx, sy, (y * w + x) * 4, dst);
      }
    }
  };
}

/** Center pinch: power > 1 shrinks center (tiny head) */
function makePinch(power: number): DistortionFn {
  return makeBulge(power);
}

/**
 * Gentle barrel distortion using Brown-Conrady polynomial model.
 * Much softer than fisheye — produces a natural wide-angle lens look.
 * k1=0.12, k2=0.05 gives subtle distortion that flatters faces.
 */
function makeBarrelSoft(k1 = 0.12, k2 = 0.05): DistortionFn {
  return (src, dst, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const invCx = 1 / cx;
    const invCy = 1 / cy;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x - cx) * invCx;
        const ny = (y - cy) * invCy;
        const r2 = nx * nx + ny * ny;
        const r4 = r2 * r2;
        const distort = 1 + k1 * r2 + k2 * r4;
        const sx = (nx / distort) * cx + cx;
        const sy = (ny / distort) * cy + cy;
        sampleBilinear(src, w, h, sx, sy, (y * w + x) * 4, dst);
      }
    }
  };
}

export const FILTERS: FilterDef[] = [
  // ── Kept unchanged ────────────────────────────────────────────────────────
  {
    id: "normal",
    name: "Normal",
    tags: ["basic"],
    cssFilter: "none",
  },
  {
    id: "heart_bubble",
    name: "Heart Bubble",
    tags: ["fun"],
    cssFilter: "brightness(1.05) saturate(1.15)",
    particleOverlay: "heart_bubble",
  },

  // ── Basic (5) — CSS only ──────────────────────────────────────────────────
  {
    id: "airy",
    name: "Airy",
    tags: ["basic"],
    cssFilter: "brightness(1.2) contrast(0.88) saturate(0.85)",
  },
  {
    id: "peach",
    name: "Peach",
    tags: ["basic"],
    cssFilter: "sepia(0.3) saturate(1.5) brightness(1.1) hue-rotate(340deg)",
  },
  {
    id: "milk",
    name: "Milk",
    tags: ["basic"],
    cssFilter: "brightness(1.15) contrast(0.82) saturate(0.7) blur(0.3px)",
  },
  {
    id: "mono",
    name: "Mono",
    tags: ["basic"],
    cssFilter: "grayscale(1) brightness(1.05) contrast(1.2)",
  },
  {
    id: "candy",
    name: "Candy",
    tags: ["basic"],
    cssFilter: "hue-rotate(310deg) saturate(1.4) brightness(1.15) contrast(0.88)",
  },

  // ── Vintage (4) ───────────────────────────────────────────────────────────
  {
    id: "film",
    name: "Film",
    tags: ["vintage"],
    cssFilter: "sepia(0.4) contrast(1.1) brightness(1.02) saturate(1.2)",
    canvasEffect: (ctx, w, h) => addFilmGrain(ctx, w, h, 30),
  },
  {
    id: "lomo",
    name: "Lomo",
    tags: ["vintage"],
    cssFilter: "saturate(1.6) contrast(1.3) brightness(0.9) hue-rotate(345deg)",
    canvasEffect: (ctx, w, h) => addVignetteOverlay(ctx, w, h, 0.65),
  },
  {
    id: "diary",
    name: "Diary",
    tags: ["vintage"],
    cssFilter: "sepia(0.2) hue-rotate(15deg) brightness(1.08) contrast(0.9) saturate(1.15)",
    canvasEffect: (ctx, w, h) => addFilmGrain(ctx, w, h, 18),
  },
  {
    id: "dusk",
    name: "Dusk",
    tags: ["vintage"],
    cssFilter: "hue-rotate(20deg) saturate(1.5) brightness(0.95) contrast(1.05) sepia(0.15)",
  },

  // ── Creative (3) ─────────────────────────────────────────────────────────
  {
    id: "bloom",
    name: "Bloom",
    tags: ["creative"],
    cssFilter: "brightness(1.25) contrast(0.85) saturate(1.1)",
    canvasEffect: addBloomGlow,
  },
  {
    id: "rose",
    name: "Rose",
    tags: ["creative"],
    cssFilter: "hue-rotate(330deg) saturate(1.6) brightness(1.1) contrast(0.92)",
  },
  {
    id: "fairy",
    name: "Fairy",
    tags: ["creative"],
    cssFilter: "brightness(1.15) saturate(1.2) hue-rotate(280deg) contrast(0.9)",
    canvasEffect: addSparkles,
  },
  {
    id: "sketch",
    name: "Sketch",
    tags: ["creative"],
    cssFilter: "none",
    canvasEffect: applyPencilSketch,
  },
  {
    id: "oilpaint",
    name: "Oil Paint",
    tags: ["creative"],
    cssFilter: "none",
    canvasEffect: (ctx, w, h) => applyKuwahara(ctx, w, h, 3),
  },
  {
    id: "duotone",
    name: "Duotone",
    tags: ["creative"],
    cssFilter: "none",
    canvasEffect: applyDuotone,
  },
  {
    id: "glitch",
    name: "Glitch",
    tags: ["creative"],
    cssFilter: "none",
    canvasEffect: applyGlitch,
  },
  {
    id: "lightleak",
    name: "Light Leak",
    tags: ["creative"],
    cssFilter: "contrast(1.05) saturate(1.1)",
    canvasEffect: applyLightLeak,
  },
  {
    id: "prism",
    name: "Prism",
    tags: ["creative"],
    cssFilter: "none",
    canvasEffect: applyPrism,
  },
  {
    id: "watercolor",
    name: "Watercolor",
    tags: ["creative"],
    cssFilter: "none",
    canvasEffect: applyWatercolor,
  },

  // ── Fun (2) ──────────────────────────────────────────────────────────────
  {
    id: "dreamy",
    name: "Dreamy",
    tags: ["fun"],
    cssFilter: "brightness(1.05) saturate(1.1)",
    distortion: makeBarrelSoft(0.12, 0.05),
  },
  {
    id: "mini",
    name: "Mini",
    tags: ["fun"],
    cssFilter: "none",
    distortion: makePinch(1.5),
  },
];
