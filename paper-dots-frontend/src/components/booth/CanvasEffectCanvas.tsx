"use client";

import { memo, useEffect, useRef } from "react";

interface Props {
  videoEl: HTMLVideoElement | null;
  cssFilter: string;
  canvasEffect: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  mirrorEnabled?: boolean;
  className?: string;
}

function CanvasEffectCanvas({
  videoEl,
  cssFilter,
  canvasEffect,
  mirrorEnabled = true,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoEl) return;
    let rafId = 0;

    function draw() {
      rafId = requestAnimationFrame(draw);
      if (!videoEl || videoEl.readyState < 2) return;

      const vw = videoEl.videoWidth || 640;
      const vh = videoEl.videoHeight || 480;

      if (canvas!.width !== vw || canvas!.height !== vh) {
        canvas!.width = vw;
        canvas!.height = vh;
      }

      const ctx = canvas!.getContext("2d", { willReadFrequently: true })!;

      if (mirrorEnabled) {
        ctx.save();
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
      }
      if (cssFilter !== "none") ctx.filter = cssFilter;
      ctx.drawImage(videoEl, 0, 0, vw, vh);
      ctx.filter = "none";
      if (mirrorEnabled) ctx.restore();

      canvasEffect(ctx, vw, vh);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [videoEl, cssFilter, canvasEffect, mirrorEnabled]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

export default memo(CanvasEffectCanvas);
