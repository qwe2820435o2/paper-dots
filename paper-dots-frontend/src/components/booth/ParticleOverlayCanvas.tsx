"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { createFaceTracker, type FaceTracker } from "@/lib/faceDetection";
import { HeartParticleSystem } from "@/lib/heartParticles";

export interface ParticleOverlayCanvasHandle {
  captureFrame(): string;
}

interface Props {
  videoEl: HTMLVideoElement;
  cssFilter: string;
  mirrorEnabled?: boolean;
  className?: string;
}

const ParticleOverlayCanvas = forwardRef<ParticleOverlayCanvasHandle, Props>(
  function ParticleOverlayCanvas({ videoEl, cssFilter, mirrorEnabled = true, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const trackerRef = useRef<FaceTracker | null>(null);
    const particlesRef = useRef(new HeartParticleSystem());
    const lastTimeRef = useRef(0);

    useImperativeHandle(ref, () => ({
      captureFrame() {
        return canvasRef.current?.toDataURL("image/png") ?? "";
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !videoEl) return;

      const tracker = createFaceTracker(videoEl);
      trackerRef.current = tracker;
      tracker.start();

      const particles = particlesRef.current;
      // Reset particles when filter activates
      particles.particles = [];

      let spawnAccum = 0;

      function draw(time: number) {
        if (!videoEl || videoEl.readyState < 2) {
          rafRef.current = requestAnimationFrame(draw);
          return;
        }

        const vw = videoEl.videoWidth || 640;
        const vh = videoEl.videoHeight || 480;

        if (canvas!.width !== vw || canvas!.height !== vh) {
          canvas!.width = vw;
          canvas!.height = vh;
        }

        const ctx = canvas!.getContext("2d")!;

        // Draw video with CSS filter and mirror
        ctx.save();
        if (cssFilter && cssFilter !== "none") {
          ctx.filter = cssFilter;
        }
        if (mirrorEnabled) {
          ctx.translate(vw, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoEl, 0, 0, vw, vh);
        ctx.restore();
        ctx.filter = "none";

        // Get face position and spawn hearts
        const face = tracker.getFaceCenter();
        const faceX = mirrorEnabled ? 1 - face.x : face.x;
        const faceY = face.y;

        // Spawn 1-2 hearts every ~3 frames
        spawnAccum++;
        if (spawnAccum >= 3) {
          spawnAccum = 0;
          particles.spawn(faceX, faceY, Math.random() < 0.5 ? 1 : 2);
        }

        particles.tick();
        particles.draw(ctx, vw, vh);

        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(draw);
      }

      rafRef.current = requestAnimationFrame(draw);

      return () => {
        cancelAnimationFrame(rafRef.current);
        tracker.stop();
      };
    }, [videoEl, cssFilter, mirrorEnabled]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
);

export default memo(ParticleOverlayCanvas);
