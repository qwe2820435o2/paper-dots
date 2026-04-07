"use client";

import { memo, useEffect, useRef } from "react";
import type { FilterDef } from "@/lib/filters";
import { drawStaticHearts } from "@/lib/heartParticles";

// Thumbnail dimensions (4:3 aspect ratio)
const TW = 96;
const TH = 72;

// Fallback: minimal sketch portrait — used when camera is not available
const MEME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 72" width="96" height="72">
  <rect width="96" height="72" fill="#f0f0f0"/>
  <path d="M 18 72 Q 22 54 48 52 Q 74 54 78 72" fill="#c8c4be" stroke="none"/>
  <circle cx="48" cy="30" r="18" fill="#e8e4de" stroke="#1a1a1a" stroke-width="1.2"/>
  <circle cx="41" cy="27" r="2.5" fill="#1a1a1a"/>
  <circle cx="55" cy="27" r="2.5" fill="#1a1a1a"/>
  <path d="M 43 35 Q 48 39 53 35" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

// Module-level cache for the meme image
let cachedMemeImg: HTMLImageElement | null = null;

// Shared rAF ticker — one loop drives all mounted FilterThumbnail instances
type TickCallback = () => void;
const _subscribers = new Set<TickCallback>();
let _rafId = 0;
let _lastTick = 0;

function _subscribe(fn: TickCallback) {
  _subscribers.add(fn);
  if (_rafId === 0) {
    function tick(now: number) {
      _rafId = requestAnimationFrame(tick);
      if (now - _lastTick < 100) return;
      _lastTick = now;
      _subscribers.forEach((cb) => cb());
    }
    _rafId = requestAnimationFrame(tick);
  }
}

function _unsubscribe(fn: TickCallback) {
  _subscribers.delete(fn);
  if (_subscribers.size === 0 && _rafId !== 0) {
    cancelAnimationFrame(_rafId);
    _rafId = 0;
  }
}

function loadMemeImage(): Promise<HTMLImageElement> {
  if (cachedMemeImg) return Promise.resolve(cachedMemeImg);
  return new Promise((resolve, reject) => {
    const blob = new Blob([MEME_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      cachedMemeImg = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface FilterThumbnailProps {
  filter: FilterDef;
  videoEl: HTMLVideoElement | null;
  mirrorEnabled?: boolean;
}

const FilterThumbnail = memo(function FilterThumbnail({
  filter,
  videoEl,
  mirrorEnabled = false,
}: FilterThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Path A: Live camera feed — update every 500ms via setInterval ─────────
  useEffect(() => {
    if (!videoEl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = TW;
    canvas.height = TH;

    // Offscreen canvas reused for distortion pixel reads
    const off = filter.distortion ? document.createElement("canvas") : null;
    if (off) { off.width = TW; off.height = TH; }
    const offCtx = off?.getContext("2d", { willReadFrequently: true }) ?? null;

    function drawMirrored(source: CanvasImageSource, target: CanvasRenderingContext2D) {
      if (mirrorEnabled) {
        target.save();
        target.translate(TW, 0);
        target.scale(-1, 1);
        target.drawImage(source, 0, 0, TW, TH);
        target.restore();
      } else {
        target.drawImage(source, 0, 0, TW, TH);
      }
    }

    function draw() {
      if (!ctx || !videoEl || videoEl.readyState < 2) return;

      if (filter.distortion) {
        drawMirrored(videoEl, offCtx!);
        const src = offCtx!.getImageData(0, 0, TW, TH);
        const dst = ctx.createImageData(TW, TH);
        filter.distortion(src.data, dst.data, TW, TH);
        ctx.putImageData(dst, 0, 0);
      } else if (filter.canvasEffect) {
        if (filter.cssFilter !== "none") ctx.filter = filter.cssFilter;
        drawMirrored(videoEl, ctx);
        ctx.filter = "none";
        filter.canvasEffect(ctx, TW, TH);
      } else if (filter.particleOverlay) {
        if (filter.cssFilter !== "none") ctx.filter = filter.cssFilter;
        drawMirrored(videoEl, ctx);
        ctx.filter = "none";
        drawStaticHearts(ctx, TW, TH);
      } else {
        if (filter.cssFilter !== "none") ctx.filter = filter.cssFilter;
        drawMirrored(videoEl, ctx);
        ctx.filter = "none";
      }
    }

    _subscribe(draw);
    return () => _unsubscribe(draw);
  }, [videoEl, filter, mirrorEnabled]);

  // ── Path B: No camera — static meme image ────────────────────────────────
  useEffect(() => {
    if (videoEl) return; // handled by Path A
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = TW;
    canvas.height = TH;

    let cancelled = false;

    loadMemeImage().then((img) => {
      if (cancelled) return;

      if (filter.distortion) {
        ctx.drawImage(img, 0, 0, TW, TH);
        const src = ctx.getImageData(0, 0, TW, TH);
        const dst = ctx.createImageData(TW, TH);
        filter.distortion(src.data, dst.data, TW, TH);
        ctx.putImageData(dst, 0, 0);
      } else {
        if (filter.cssFilter !== "none") ctx.filter = filter.cssFilter;
        ctx.drawImage(img, 0, 0, TW, TH);
        ctx.filter = "none";
        if (filter.particleOverlay) {
          drawStaticHearts(ctx, TW, TH);
        } else {
          filter.canvasEffect?.(ctx, TW, TH);
        }
      }
    });

    return () => { cancelled = true; };
  }, [videoEl, filter]);

  return (
    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
      <canvas ref={canvasRef} width={TW} height={TH} className="w-full h-full object-cover" />
    </div>
  );
});

export default FilterThumbnail;
