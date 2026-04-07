"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CapturedShotsPanel() {
  const capturedShots = useSelector((s: RootState) => s.booth.capturedShots);
  const totalShots = useSelector((s: RootState) => s.booth.totalShots);
  const isDone = useSelector((s: RootState) => s.booth.stripDataUrl !== null);

  return (
    <div className="w-44 shrink-0 border-r border-border bg-card/40 hidden md:flex flex-col overflow-hidden">
      <style>{`
        @keyframes shotSlideIn {
          0%   { opacity: 0; transform: translateY(12px) scale(0.95); }
          60%  { opacity: 1; transform: translateY(-3px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .shot-slide-in {
          animation: shotSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <div className="px-3 py-2 shrink-0 border-b border-border">
        <span className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em]">
          Photos · {capturedShots.length} / {totalShots}
        </span>
      </div>

      {/* Photo list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5">
        {/* Captured shots */}
        {capturedShots.map((shot, i) => {
          const isLast = i === capturedShots.length - 1;
          return (
            <div
              key={i}
              className="shot-slide-in relative w-full rounded-lg overflow-hidden shadow-sm"
              style={{
                aspectRatio: "4/3",
                flexShrink: 0,
                outline: isDone && isLast ? "2px solid hsl(var(--primary))" : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot}
                alt={`Shot ${i + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-1.5 left-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary/80 text-primary-foreground text-[10px] font-bold">
                {i + 1}
              </div>
            </div>
          );
        })}

        {/* Placeholder slots for remaining shots */}
        {Array.from({ length: totalShots - capturedShots.length }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="relative w-full rounded-xl border border-dashed border-border/60 bg-muted flex items-center justify-center"
            style={{ aspectRatio: "4/3", flexShrink: 0 }}
          >
            <span className="text-[10px] text-muted-foreground/40 font-medium tabular-nums">
              {capturedShots.length + i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
