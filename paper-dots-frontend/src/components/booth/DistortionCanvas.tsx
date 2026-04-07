"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { DistortionFn } from "@/lib/filters";

export interface DistortionCanvasHandle {
  captureFrame(): string;
}

interface Props {
  videoEl: HTMLVideoElement | null;
  distortion: DistortionFn;
  mirrorEnabled?: boolean;
  className?: string;
}

const DistortionCanvas = forwardRef<DistortionCanvasHandle, Props>(
  function DistortionCanvas({ videoEl, distortion, mirrorEnabled = true, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const offscreenRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => ({
      captureFrame() {
        return canvasRef.current?.toDataURL("image/png") ?? "";
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !videoEl) return;

      // Offscreen canvas for reading raw video pixels
      const off = document.createElement("canvas");
      offscreenRef.current = off;

      let lastDrawTime = 0;
      const FRAME_INTERVAL = 1000 / 30; // cap at 30fps for heavy pixel ops

      function draw(time: number) {
        rafRef.current = requestAnimationFrame(draw);

        if (!videoEl || videoEl.readyState < 2) return;

        // Throttle to 30fps
        if (time - lastDrawTime < FRAME_INTERVAL) return;
        lastDrawTime = time;

        const vw = videoEl.videoWidth || 640;
        const vh = videoEl.videoHeight || 480;

        if (off.width !== vw || off.height !== vh) {
          off.width = vw;
          off.height = vh;
        }
        if (canvas!.width !== vw || canvas!.height !== vh) {
          canvas!.width = vw;
          canvas!.height = vh;
        }

        const offCtx = off.getContext("2d", { willReadFrequently: true })!;

        // Draw mirrored video to offscreen
        if (mirrorEnabled) {
          offCtx.save();
          offCtx.translate(vw, 0);
          offCtx.scale(-1, 1);
          offCtx.drawImage(videoEl, 0, 0, vw, vh);
          offCtx.restore();
        } else {
          offCtx.drawImage(videoEl, 0, 0, vw, vh);
        }

        const srcData = offCtx.getImageData(0, 0, vw, vh);
        const dstData = offCtx.createImageData(vw, vh);

        distortion(srcData.data, dstData.data, vw, vh);

        const ctx = canvas!.getContext("2d")!;
        ctx.putImageData(dstData, 0, 0);
      }

      rafRef.current = requestAnimationFrame(draw);

      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }, [videoEl, distortion, mirrorEnabled]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
);

export default DistortionCanvas;
