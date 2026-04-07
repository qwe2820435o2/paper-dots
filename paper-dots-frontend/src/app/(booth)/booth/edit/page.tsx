"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { clearCapture } from "@/store/slices/boothSlice";
import { clearEdit, clearSelection } from "@/store/slices/editSlice";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import type { EditCanvasHandle } from "@/components/edit/EditCanvas";
import SketchLoader from "@/components/common/SketchLoader";

const EditCanvas = dynamic(() => import("@/components/edit/EditCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <SketchLoader message="Preparing your canvas..." />
    </div>
  ),
});
import PhotoThumbnailPanel from "@/components/edit/PhotoThumbnailPanel";
import { TemplateGrid } from "@/components/edit/TemplateGrid";
import { StickerGrid } from "@/components/edit/StickerGrid";
import { ArrowLeft, Download, Layers, Share2, Smile, Image, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileTab = "canvas" | "photos" | "templates" | "stickers";

export default function EditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const canvasRef = useRef<EditCanvasHandle>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("canvas");

  const capturedShots = useSelector(
    (state: RootState) => state.booth.capturedShots
  );
  // Guard: redirect if no photos
  useEffect(() => {
    if (capturedShots.length === 0) {
      router.replace("/booth");
    }
  }, [capturedShots.length, router]);

  function handleDownload() {
    dispatch(clearSelection());
    requestAnimationFrame(async () => {
      const dataUrl = canvasRef.current?.getDataUrl();
      if (!dataUrl) return;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `photo-strip-${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `photo-strip-${Date.now()}.png`;
      a.click();
    });
  }

  function handleShare() {
    dispatch(clearSelection());
    requestAnimationFrame(async () => {
      try {
        const dataUrl = canvasRef.current?.getDataUrl();
        if (!dataUrl) return;

        const [header, base64] = dataUrl.split(",");
        const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });

        const file = new File([blob], `photo-strip-${Date.now()}.png`, { type: mime });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] });
        } else {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          alert("Image copied to clipboard!");
        }
      } catch (err) {
        console.error("Share failed:", err);
        alert("Could not share the image. Please use Save instead.");
      }
    });
  }

  function handleRetake() {
    dispatch(clearEdit());
    dispatch(clearCapture());
    router.push("/booth");
  }

  if (capturedShots.length === 0) return null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 h-[52px] border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
          onClick={handleRetake}
        >
          <ArrowLeft className="w-4 h-4" />
          Retake
        </Button>
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-sm font-medium text-primary tracking-wide">Paper Dots</span>
          <svg width="24" height="12" viewBox="0 0 48 24" fill="none" className="text-accent opacity-40">
            <path d="M24 20C18 14 8 12 2 14C8 8 18 6 24 4C30 6 40 8 46 14C40 12 30 14 24 20Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="24" y1="4" x2="24" y2="22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="w-24" />
      </div>

      {/* Main content: 3 columns */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
        {/* Left: Photo thumbnails (draggable) — desktop only */}
        <div className="hidden md:block">
          <PhotoThumbnailPanel />
        </div>

        {/* Center: Interactive canvas */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-3 pt-2 pb-6 bg-background relative">
          {/* Checkerboard background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#888 0% 25%, transparent 0% 50%)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 h-full w-full flex items-start justify-center pt-1">
            <EditCanvas ref={canvasRef} />
          </div>

          {/* Mobile overlay panels */}
          {mobileTab !== "canvas" && (
            <div className="md:hidden absolute inset-0 z-30 bg-card flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <span className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em]">
                  {mobileTab === "photos" ? "Photos" : mobileTab === "templates" ? "Templates" : "Stickers"}
                </span>
                <button
                  onClick={() => setMobileTab("canvas")}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {mobileTab === "photos" && (
                  <div className="grid grid-cols-3 gap-2">
                    {capturedShots.map((shot, i) => (
                      <div
                        key={i}
                        className="relative w-full rounded-lg overflow-hidden shadow-sm border border-border"
                        style={{ aspectRatio: "4/3" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shot} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary/80 text-primary-foreground text-[10px] font-bold">
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {mobileTab === "templates" && <TemplateGrid />}
                {mobileTab === "stickers" && <StickerGrid />}
              </div>
            </div>
          )}

          {/* Floating action bar */}
          <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-border">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full px-5"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-full px-5"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Right: Edit panel — desktop only */}
        <div className="hidden md:flex w-72 shrink-0 border-l border-border bg-card flex-col overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col p-4 gap-5 overflow-hidden">
            <section className="flex-none">
              <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Templates
              </p>
              <TemplateGrid />
            </section>
            <section className="flex-1 min-h-0">
              <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                Stickers
              </p>
              <StickerGrid />
            </section>
          </div>
        </div>
      </div>

      {/* 移动端底部 Tab 导航 */}
      <div className="md:hidden shrink-0 flex items-stretch border-t border-border bg-card h-16">
        {(
          [
            { tab: "canvas", icon: Maximize2, label: "Canvas" },
            { tab: "photos", icon: Image, label: "Photos" },
            { tab: "templates", icon: Layers, label: "Templates" },
            { tab: "stickers", icon: Smile, label: "Stickers" },
          ] as const
        ).map(({ tab, icon: Icon, label }) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab === mobileTab && tab !== "canvas" ? "canvas" : tab)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              mobileTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
