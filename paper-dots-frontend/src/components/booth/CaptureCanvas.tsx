"use client";

import { forwardRef, useImperativeHandle } from "react";
import type { FilterDef } from "@/lib/filters";
import { canvasToBlob } from "@/lib/photoBlobStore";

const SHOT_W = 1280;
const SHOT_H = 960;

/** Free canvas GPU/memory by zeroing its dimensions */
function freeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

export interface CaptureCanvasHandle {
  captureShot(videoEl: HTMLVideoElement, overlayUrl: string | null, filter?: FilterDef): Promise<string>;
  captureFromDataUrl(dataUrl: string): Promise<string>;
  captureMockShot(shotIndex: number): Promise<string>;
  buildStrip(shots: string[]): Promise<string>;
}

const CaptureCanvas = forwardRef<CaptureCanvasHandle>(
  function CaptureCanvas(_props, ref) {
    useImperativeHandle(ref, () => ({
      async captureMockShot(shotIndex: number) {
        const canvas = document.createElement("canvas");
        canvas.width = SHOT_W;
        canvas.height = SHOT_H;
        const ctx = canvas.getContext("2d")!;
        const palettes = [
          ["#f472b6", "#a855f7"],
          ["#38bdf8", "#6366f1"],
          ["#34d399", "#06b6d4"],
          ["#fb923c", "#f43f5e"],
        ];
        const [c1, c2] = palettes[shotIndex % palettes.length];
        const grad = ctx.createLinearGradient(0, 0, SHOT_W, SHOT_H);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, SHOT_W, SHOT_H);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.font = `bold ${SHOT_H / 4}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`📷 ${shotIndex + 1}`, SHOT_W / 2, SHOT_H / 2);
        const url = await canvasToBlob(canvas);
        freeCanvas(canvas);
        return url;
      },

      async captureShot(videoEl, overlayUrl, filter) {
        const canvas = document.createElement("canvas");
        canvas.width = SHOT_W;
        canvas.height = SHOT_H;
        const ctx = canvas.getContext("2d")!;

        // Apply CSS filter before drawing video frame
        if (filter?.cssFilter && filter.cssFilter !== "none") {
          ctx.filter = filter.cssFilter;
        }

        // Mirror horizontally to match video preview
        ctx.save();
        ctx.translate(SHOT_W, 0);
        ctx.scale(-1, 1);
        const isMobilePhone = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) &&
          !/iPad/.test(navigator.userAgent);
        if (isMobilePhone) {
          const vw = videoEl.videoWidth || SHOT_W;
          const vh = videoEl.videoHeight || SHOT_H;
          const scale = Math.max(SHOT_W / vw, SHOT_H / vh);
          const sw = vw * scale;
          const sh = vh * scale;
          const ox = (SHOT_W - sw) / 2;
          const oy = (SHOT_H - sh) / 2;
          ctx.drawImage(videoEl, ox, oy, sw, sh);
        } else {
          ctx.drawImage(videoEl, 0, 0, SHOT_W, SHOT_H);
        }
        ctx.restore();

        ctx.filter = "none";

        // Apply additional canvas pixel effects (grain, sketch, etc.)
        filter?.canvasEffect?.(ctx, SHOT_W, SHOT_H);

        if (overlayUrl) {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              ctx.drawImage(img, 0, 0, SHOT_W, SHOT_H);
              resolve();
            };
            img.onerror = reject;
            img.src = overlayUrl;
          });
        }

        const url = await canvasToBlob(canvas);
        freeCanvas(canvas);
        return url;
      },

      async captureFromDataUrl(dataUrl) {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = SHOT_W;
            canvas.height = SHOT_H;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, SHOT_W, SHOT_H);
            canvasToBlob(canvas).then((url) => { freeCanvas(canvas); resolve(url); }, reject);
          };
          img.onerror = reject;
          img.src = dataUrl;
        });
      },

      async buildStrip(shots) {
        const strip = document.createElement("canvas");
        strip.width = SHOT_W;
        strip.height = SHOT_H * shots.length;
        const ctx = strip.getContext("2d")!;

        await Promise.all(
          shots.map(
            (url, i) =>
              new Promise<void>((resolve, reject) => {
                const img = new window.Image();
                img.onload = () => {
                  ctx.drawImage(img, 0, i * SHOT_H, SHOT_W, SHOT_H);
                  resolve();
                };
                img.onerror = reject;
                img.src = url;
              })
          )
        );

        const url = await canvasToBlob(strip);
        freeCanvas(strip);
        return url;
      },
    }));

    return null;
  }
);

export default CaptureCanvas;
