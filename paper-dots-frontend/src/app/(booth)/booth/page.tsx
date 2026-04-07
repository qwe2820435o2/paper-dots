"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  addCapturedShot,
  clearCapture,
  setStripDataUrl,
  setMirror,
  setTimerSec,
  setTotalShots,
  setRingLight,
  setRingLightIntensity,
  setRingLightSaturation,
  setRingLightColor,
  setFilter,
} from "@/store/slices/boothSlice";
import { FILTERS, type FilterTag } from "@/lib/filters";
import WebcamCapture, { WebcamHandle } from "@/components/booth/WebcamCapture";
import DistortionCanvas, { DistortionCanvasHandle } from "@/components/booth/DistortionCanvas";
import CanvasEffectCanvas from "@/components/booth/CanvasEffectCanvas";
import ParticleOverlayCanvas, { ParticleOverlayCanvasHandle } from "@/components/booth/ParticleOverlayCanvas";
import CaptureCanvas, { CaptureCanvasHandle } from "@/components/booth/CaptureCanvas";
import FilterThumbnail from "@/components/booth/FilterThumbnail";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, ArrowLeft, FlipHorizontal, Sun, Droplets, Settings, X } from "lucide-react";
import SketchLoader from "@/components/common/SketchLoader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { revokeAllPhotoBlobUrls } from "@/lib/photoBlobStore";
import CapturedShotsPanel from "@/components/booth/CapturedShotsPanel";

// 18 preset colors arranged in 3 rows of 6 (color wheel order)
const RING_LIGHT_PRESETS = [
  "#ff2244", "#ff5522", "#ff9922", "#ffcc22", "#ccdd22", "#44dd44",
  "#22ddaa", "#22ccdd", "#22aaff", "#4466ff", "#8844ee", "#cc33ff",
  "#ee22aa", "#ff4488", "#ff88bb", "#ffccee", "#ffffff", "#aaccff",
];

// Color swatch layout constants
const SWATCH_SIZE = 32;
const SWATCH_COLS = 6;

function SwatchRow({
  colors,
  selected,
  onSelect,
}: {
  colors: string[];
  selected: string;
  onSelect: (c: string) => void;
}) {
  return (
    <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${SWATCH_COLS}, 1fr)` }}>
      {colors.map((color) => (
        <button
          key={color}
          className={cn(
            "rounded-full transition-all duration-200 focus:outline-none",
            selected === color
              ? "scale-[1.15]"
              : "opacity-85 hover:opacity-100 hover:scale-105"
          )}
          style={{
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
            backgroundColor: color,
            boxShadow: selected === color
              ? `0 0 14px 5px ${color}99, 0 0 4px 1px ${color}`
              : "0 2px 6px rgba(0,0,0,0.35)",
          }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function computeRingLightStyle(
  enabled: boolean,
  intensity: number,
  saturation: number,
  color: string
): React.CSSProperties | undefined {
  if (!enabled) return undefined;
  const [pr, pg, pb] = hexToRgb(color);
  const s = saturation / 100;
  const r = Math.round(255 + (pr - 255) * s);
  const g = Math.round(255 + (pg - 255) * s);
  const b = Math.round(255 + (pb - 255) * s);
  const alpha = intensity / 100;
  const spread = Math.round(intensity * 0.5);
  const blur1 = Math.round(intensity * 1.2);
  const blur2 = Math.round(intensity * 0.6);
  const insetB = Math.round(intensity * 0.4);
  return {
    boxShadow: [
      `0 0 ${blur1}px ${spread}px rgba(${r},${g},${b},${(alpha * 0.45).toFixed(2)})`,
      `0 0 ${blur2}px ${Math.round(spread * 0.5)}px rgba(${r},${g},${b},${(alpha * 0.7).toFixed(2)})`,
      `inset 0 0 ${insetB}px rgba(${r},${g},${b},${(alpha * 0.25).toFixed(2)})`,
    ].join(", "),
    borderColor: `rgba(${r},${g},${b},${(alpha * 0.8).toFixed(2)})`,
    transition: "box-shadow 200ms ease, border-color 200ms ease",
  };
}

export default function BoothPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedFilterId = useSelector((s: RootState) => s.booth.selectedFilterId);
  const stripDataUrl = useSelector((s: RootState) => s.booth.stripDataUrl);
  const webcamStatus = useSelector((s: RootState) => s.booth.webcamStatus);
  const mirrorEnabled = useSelector((s: RootState) => s.booth.mirrorEnabled);
  const timerSec = useSelector((s: RootState) => s.booth.timerSec);
  const totalShots = useSelector((s: RootState) => s.booth.totalShots);
  const ringLightEnabled = useSelector((s: RootState) => s.booth.ringLightEnabled);
  const ringLightIntensity = useSelector((s: RootState) => s.booth.ringLightIntensity);
  const ringLightSaturation = useSelector((s: RootState) => s.booth.ringLightSaturation);
  const ringLightColor = useSelector((s: RootState) => s.booth.ringLightColor);

  const activeFilter = FILTERS.find((f) => f.id === selectedFilterId) ?? FILTERS[0];

  const webcamRef = useRef<WebcamHandle>(null);
  const distortionRef = useRef<DistortionCanvasHandle>(null);
  const particleOverlayRef = useRef<ParticleOverlayCanvasHandle>(null);
  const canvasRef = useRef<CaptureCanvasHandle>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [liveVideoEl, setLiveVideoEl] = useState<HTMLVideoElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShot, setCurrentShot] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [activeFilterTag, setActiveFilterTag] = useState<FilterTag | "all">("all");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMdOrLarger, setIsMdOrLarger] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  });
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMdOrLarger(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMdOrLarger(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    revokeAllPhotoBlobUrls();
    dispatch(clearCapture());
  }, [dispatch]);

  const runCountdown = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      let t = timerSec;
      setCountdown(t);
      const interval = setInterval(() => {
        t--;
        if (t <= 0) {
          clearInterval(interval);
          setCountdown(null);
          resolve();
        } else {
          setCountdown(t);
        }
      }, 1000);
    });
  }, [timerSec]);

  const isMock = webcamStatus === "mock";

  const handleStartCapture = useCallback(async () => {
    if ((webcamStatus !== "active" && webcamStatus !== "mock") || isCapturing) return;
    setIsCapturing(true);

    const shots: string[] = [];

    for (let i = 0; i < totalShots; i++) {
      setCurrentShot(i + 1);
      await runCountdown();

      if (!canvasRef.current) break;

      let dataUrl: string;
      if (isMock) {
        dataUrl = await canvasRef.current.captureMockShot(i);
      } else if (activeFilter.distortion) {
        const frame = distortionRef.current?.captureFrame();
        if (!frame) break;
        dataUrl = await canvasRef.current.captureFromDataUrl(frame);
      } else if (activeFilter.particleOverlay) {
        const frame = particleOverlayRef.current?.captureFrame();
        if (!frame) break;
        dataUrl = await canvasRef.current.captureFromDataUrl(frame);
      } else {
        const videoEl = webcamRef.current?.videoEl;
        if (!videoEl) break;
        dataUrl = await canvasRef.current.captureShot(videoEl, null, activeFilter);
      }
      // Flash effect
      setFlashing(true);
      await new Promise<void>((r) => setTimeout(r, 180));
      setFlashing(false);

      shots.push(dataUrl);
      dispatch(addCapturedShot(dataUrl));
    }

    if (shots.length === totalShots) {
      const strip = await canvasRef.current!.buildStrip(shots);
      dispatch(setStripDataUrl(strip));
      setIsNavigating(true);
      router.push('/booth/edit');
      return;
    }

    setIsCapturing(false);
    setCurrentShot(0);
  }, [webcamStatus, isMock, isCapturing, runCountdown, activeFilter, totalShots, dispatch]);

  const [lr, lg, lb] = hexToRgb(ringLightColor);
  const ringLightStyle = computeRingLightStyle(ringLightEnabled, ringLightIntensity, ringLightSaturation, ringLightColor);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* 顶栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-sm font-medium text-primary tracking-wide">Paper Dots</span>
          <svg width="24" height="12" viewBox="0 0 48 24" fill="none" className="text-accent opacity-40">
            <path d="M24 20C18 14 8 12 2 14C8 8 18 6 24 4C30 6 40 8 46 14C40 12 30 14 24 20Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="24" y1="4" x2="24" y2="22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="w-24" />
      </div>

      {/* 主内容：三栏 */}
      <div className="flex-1 min-h-0 flex flex-row gap-0 overflow-hidden">
        {/* 左侧：已拍照片预览栏 */}
        <CapturedShotsPanel />

        {/* 中间：取景框 */}
        <div className="flex-1 flex items-center justify-center p-3 md:p-6 bg-background">
          <div
              className="w-full"
              style={{
                maxWidth: isCapturing ? '52rem' : '42rem',
                transform: (isMdOrLarger && isCapturing && !isIOS) ? 'translateX(-144px)' : 'translateX(0)',
                transition: isCapturing
                  ? 'max-width 450ms 80ms cubic-bezier(0.4,0,0.2,1), transform 450ms 80ms cubic-bezier(0.4,0,0.2,1)'
                  : 'max-width 400ms cubic-bezier(0.34,1.56,0.64,1), transform 400ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border/70 shadow-sm transition-shadow duration-300"
              style={ringLightStyle}
            >
              {webcamStatus === "requesting" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Requesting camera...</p>
                </div>
              )}
              {/* Video is always mounted to keep stream alive */}
              <WebcamCapture
                ref={webcamRef}
                mirrorEnabled={mirrorEnabled}
                deviceId={selectedDeviceId}
                cssFilter={(activeFilter.distortion || activeFilter.canvasEffect || activeFilter.particleOverlay) ? "none" : activeFilter.cssFilter}
                className={(activeFilter.distortion || activeFilter.canvasEffect || activeFilter.particleOverlay) ? "invisible absolute" : undefined}
                onReady={() => setLiveVideoEl(webcamRef.current?.videoEl ?? null)}
                onDevicesReady={(devices) => {
                  setCameras(devices);
                  if (!selectedDeviceId && devices.length > 0) {
                    setSelectedDeviceId(devices[0].deviceId);
                  }
                }}
              />
              {/* Distortion canvas overlays video for fun filters */}
              {activeFilter.distortion && liveVideoEl && (
                <DistortionCanvas
                  ref={distortionRef}
                  videoEl={liveVideoEl}
                  distortion={activeFilter.distortion}
                  mirrorEnabled={mirrorEnabled}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              )}
              {/* CanvasEffect canvas overlays video for grain/noise filters */}
              {!activeFilter.distortion && activeFilter.canvasEffect && liveVideoEl && (
                <CanvasEffectCanvas
                  videoEl={liveVideoEl}
                  cssFilter={activeFilter.cssFilter}
                  canvasEffect={activeFilter.canvasEffect}
                  mirrorEnabled={mirrorEnabled}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              )}
              {/* Particle overlay canvas for heart bubble etc. */}
              {!activeFilter.distortion && !activeFilter.canvasEffect && activeFilter.particleOverlay && liveVideoEl && (
                <ParticleOverlayCanvas
                  ref={particleOverlayRef}
                  videoEl={liveVideoEl}
                  cssFilter={activeFilter.cssFilter}
                  mirrorEnabled={mirrorEnabled}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              )}
              {/* 倒计时覆盖层 */}
              {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-28 h-28">
                      {/* Background — fades out over the full second */}
                      <div
                        key={`bg-${countdown}`}
                        className="card-fade absolute inset-0 rounded-2xl bg-[#faf7f2]/30 backdrop-blur-md border border-[#d4ccc2]/40 shadow-xl"
                      />
                      {/* Number — pops in */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          key={`num-${countdown}`}
                          className="count-pop text-6xl font-bold tabular-nums select-none"
                          style={{ color: "white", textShadow: "0 0 20px rgba(250,247,242,0.9), 0 2px 8px rgba(74,63,53,0.4)" }}
                        >
                          {countdown}
                        </span>
                      </div>
                    </div>
                  </div>
              )}

              {/* 拍摄闪光 */}
              {flashing && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ backgroundColor: "white", opacity: 0.85, transition: "opacity 180ms ease-out" }}
                />
              )}

              {/* 拍摄进度 — 胶片点阵 */}
              {isCapturing && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalShots }).map((_, i) => {
                      const isDone = i < currentShot - 1 || (i === currentShot - 1 && flashing);
                      const isActive = i === currentShot - 1 && !flashing;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "rounded-full transition-all duration-300",
                            isDone
                              ? "w-3 h-3 bg-white"
                              : isActive
                              ? "w-3 h-3 bg-white/90 animate-pulse"
                              : "w-2 h-2 bg-white/30"
                          )}
                          style={isDone ? { boxShadow: "0 0 8px 3px rgba(255,255,255,0.45)" } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 跳转等待动画 */}
              {isNavigating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <SketchLoader message="Developing your strip..." />
                </div>
              )}
            </div>

            {/* 快门按钮 — 取景框下方 */}
            {!isCapturing && webcamStatus !== "denied" && webcamStatus !== "error" && (
              <div className="flex flex-col items-center gap-3 mt-5">
                <button
                  onClick={stripDataUrl !== null ? () => { dispatch(clearCapture()); handleStartCapture(); } : handleStartCapture}
                  disabled={!stripDataUrl !== null && webcamStatus !== "active" && webcamStatus !== "mock"}
                  className="group"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-primary flex items-center justify-center border-2 border-primary/40 shadow-[0_4px_12px_rgba(107,92,76,0.3)] transition-all duration-150",
                    "group-hover:scale-110 group-hover:shadow-[0_4px_20px_rgba(107,92,76,0.4)] group-active:scale-95",
                    (!stripDataUrl !== null && webcamStatus !== "active" && webcamStatus !== "mock") && "opacity-40 cursor-not-allowed"
                  )}>
                    <Camera className="w-7 h-7 text-primary-foreground" />
                  </div>
                </button>
                {/* 移动端设置按钮 */}
                <button
                  onClick={() => setShowMobileSettings(true)}
                  className="md:hidden flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：设置面板（拍照时自动折叠，移动端隐藏） */}
        <div
          className="shrink-0 border-l border-border bg-card hidden md:flex flex-col overflow-hidden"
          style={{
            width: isCapturing ? 0 : 288,
            opacity: isCapturing ? 0 : 1,
            transition: isCapturing
              ? 'opacity 150ms ease-in, width 450ms 80ms cubic-bezier(0.4,0,0.2,1)'
              : 'width 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms 250ms ease-out',
          }}
        >
          <div className="w-72 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 p-4 flex flex-col gap-5 overflow-hidden">
            {/* 相机源 + 镜像 */}
            <section className="shrink-0">
              <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
                Camera
              </p>
              <div className="flex gap-2">
                <Select
                  value={selectedDeviceId ?? ""}
                  onValueChange={(v) => setSelectedDeviceId(v)}
                  disabled={cameras.length === 0}
                >
                  <SelectTrigger className="flex-1 min-w-0 h-9 text-sm">
                    <SelectValue placeholder="Detecting…" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((cam, idx) => {
                      const label = cam.label || `Camera ${idx + 1}`;
                      const shortId = cam.deviceId.slice(0, 4);
                      return (
                        <SelectItem key={cam.deviceId} value={cam.deviceId}>
                          {label} ({shortId})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  variant={mirrorEnabled ? "default" : "outline"}
                  size="sm"
                  className="h-9 px-3 shrink-0"
                  onClick={() => dispatch(setMirror(!mirrorEnabled))}
                  title="Mirror"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </section>

            {/* 定时 + 张数 */}
            <section className="shrink-0">
              <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
                Settings
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Timer</p>
                  <Select
                    value={String(timerSec)}
                    onValueChange={(v) => dispatch(setTimerSec(Number(v)))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3s</SelectItem>
                      <SelectItem value="4">4s</SelectItem>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="6">6s</SelectItem>
                      <SelectItem value="7">7s</SelectItem>
                      <SelectItem value="8">8s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Shots</p>
                  <Select
                    value={String(totalShots)}
                    onValueChange={(v) => dispatch(setTotalShots(Number(v)))}
                    disabled={isCapturing}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[4].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Ring Light */}
            <section className="shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Ring Light
                  </p>
                  {ringLightEnabled && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-border/60 transition-colors duration-200 shrink-0"
                      style={{ backgroundColor: `rgb(${lr},${lg},${lb})` }}
                    />
                  )}
                </div>
                <Switch
                  checked={ringLightEnabled}
                  onCheckedChange={(v) => dispatch(setRingLight(v))}
                />
              </div>

              <div className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                ringLightEnabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}>
              <div className="overflow-hidden -mx-2"><div className="space-y-3 pb-2 px-2">
                {/* Intensity */}
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="relative flex-1">
                    <div
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, rgba(${lr},${lg},${lb},0.15), rgba(${lr},${lg},${lb},1))`,
                      }}
                    />
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[ringLightIntensity]}
                      onValueChange={([v]) => dispatch(setRingLightIntensity(v))}
                      className="[&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                    {ringLightIntensity}%
                  </span>
                </div>

                {/* Saturation */}
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="relative flex-1">
                    <div
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, #ffffff, ${ringLightColor})`,
                      }}
                    />
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[ringLightSaturation]}
                      onValueChange={([v]) => dispatch(setRingLightSaturation(v))}
                      className="[&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                    {ringLightSaturation}%
                  </span>
                </div>

                {/* Color presets */}
                <div className="pt-1">
                  <SwatchRow
                    colors={RING_LIGHT_PRESETS}
                    selected={ringLightColor}
                    onSelect={(c) => dispatch(setRingLightColor(c))}
                  />
                </div>
              </div></div></div>
            </section>

            {/* Filter Picker */}
            <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
                Filter
              </p>
              {/* Tag pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(["all", "basic", "vintage", "creative", "fun"] as const).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveFilterTag(tag)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                      activeFilterTag === tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {tag === "all" ? "All" : tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </button>
                ))}
              </div>
              {/* Filter grid */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-1.5">
                {(activeFilterTag === "all"
                  ? FILTERS
                  : FILTERS.filter((f) => f.tags.includes(activeFilterTag as FilterTag))
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => dispatch(setFilter(f.id))}
                    className={cn(
                      "flex flex-col items-center gap-1 p-1 rounded-xl border-2 transition-all duration-150",
                      selectedFilterId === f.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/40"
                    )}
                  >
                    <FilterThumbnail filter={f} videoEl={liveVideoEl} mirrorEnabled={mirrorEnabled} />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center leading-tight">
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
              </div>
            </section>
          </div>

          </div>
        </div>
      </div>

      <CaptureCanvas ref={canvasRef} />

      {/* 移动端设置底部抽屉 */}
      {showMobileSettings && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileSettings(false)}
          />
          {/* 抽屉主体 */}
          <div className="relative bg-card rounded-t-2xl border-t border-border flex flex-col max-h-[80vh]">
            {/* 拖拽条 + 关闭按钮 */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <span className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em]">
                Settings
              </span>
              <button
                onClick={() => setShowMobileSettings(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* 设置内容（可滚动） */}
            <div className="overflow-y-auto flex-1 min-h-0 px-4 pb-6 flex flex-col gap-5">
              {/* Camera */}
              <section className="shrink-0">
                <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  Camera
                </p>
                <div className="flex gap-2">
                  <Select
                    value={selectedDeviceId ?? ""}
                    onValueChange={(v) => setSelectedDeviceId(v)}
                    disabled={cameras.length === 0}
                  >
                    <SelectTrigger className="flex-1 min-w-0 h-9 text-sm">
                      <SelectValue placeholder="Detecting…" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameras.map((cam, idx) => {
                        const label = cam.label || `Camera ${idx + 1}`;
                        const shortId = cam.deviceId.slice(0, 4);
                        return (
                          <SelectItem key={cam.deviceId} value={cam.deviceId}>
                            {label} ({shortId})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={mirrorEnabled ? "default" : "outline"}
                    size="sm"
                    className="h-9 px-3 shrink-0"
                    onClick={() => dispatch(setMirror(!mirrorEnabled))}
                    title="Mirror"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </section>

              {/* Timer + Shots */}
              <section className="shrink-0">
                <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  Capture
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Timer</p>
                    <Select
                      value={String(timerSec)}
                      onValueChange={(v) => dispatch(setTimerSec(Number(v)))}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3s</SelectItem>
                        <SelectItem value="4">4s</SelectItem>
                        <SelectItem value="5">5s</SelectItem>
                        <SelectItem value="6">6s</SelectItem>
                        <SelectItem value="7">7s</SelectItem>
                        <SelectItem value="8">8s</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Shots</p>
                    <Select
                      value={String(totalShots)}
                      onValueChange={(v) => dispatch(setTotalShots(Number(v)))}
                      disabled={isCapturing}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[4].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Ring Light */}
              <section className="shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em]">
                      Ring Light
                    </p>
                    {ringLightEnabled && (
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-border/60 transition-colors duration-200 shrink-0"
                        style={{ backgroundColor: `rgb(${lr},${lg},${lb})` }}
                      />
                    )}
                  </div>
                  <Switch
                    checked={ringLightEnabled}
                    onCheckedChange={(v) => dispatch(setRingLight(v))}
                  />
                </div>
                <div className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  ringLightEnabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}>
                  <div className="overflow-hidden -mx-2"><div className="space-y-3 pb-2 px-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="relative flex-1">
                        <div
                          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none"
                          style={{ background: `linear-gradient(to right, rgba(${lr},${lg},${lb},0.15), rgba(${lr},${lg},${lb},1))` }}
                        />
                        <Slider
                          min={0} max={100} step={1}
                          value={[ringLightIntensity]}
                          onValueChange={([v]) => dispatch(setRingLightIntensity(v))}
                          className="[&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{ringLightIntensity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="relative flex-1">
                        <div
                          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none"
                          style={{ background: `linear-gradient(to right, #ffffff, ${ringLightColor})` }}
                        />
                        <Slider
                          min={0} max={100} step={1}
                          value={[ringLightSaturation]}
                          onValueChange={([v]) => dispatch(setRingLightSaturation(v))}
                          className="[&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{ringLightSaturation}%</span>
                    </div>
                    <div className="pt-1">
                      <SwatchRow
                        colors={RING_LIGHT_PRESETS}
                        selected={ringLightColor}
                        onSelect={(c) => dispatch(setRingLightColor(c))}
                      />
                    </div>
                  </div></div>
                </div>
              </section>

              {/* Filter */}
              <section className="shrink-0">
                <p className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  Filter
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(["all", "basic", "vintage", "creative", "fun"] as const).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveFilterTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        activeFilterTag === tag
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      {tag === "all" ? "All" : tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(activeFilterTag === "all"
                    ? FILTERS
                    : FILTERS.filter((f) => f.tags.includes(activeFilterTag as FilterTag))
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { dispatch(setFilter(f.id)); setShowMobileSettings(false); }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-1 rounded-xl border-2 transition-all duration-150",
                        selectedFilterId === f.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/40"
                      )}
                    >
                      <FilterThumbnail filter={f} videoEl={liveVideoEl} mirrorEnabled={mirrorEnabled} />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center leading-tight">
                        {f.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
