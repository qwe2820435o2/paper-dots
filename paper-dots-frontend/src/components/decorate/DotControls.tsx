"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Circle as CircleIcon,
  Flower2,
  Heart,
  Crown,
  Leaf,
  Moon,
  Shuffle,
  Diamond,
  Star,
  Snowflake,
  Type,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDotShape,
  setDotCount,
  setDotSize,
  setDotVariance,
  setDotColor,
  setDotColorMode,
  setDotPaletteId,
  setDotGradientColor1,
  setDotGradientColor2,
  setDotGradientDirection,
  setDotOpacity,
  setCharacter,
  rerollSeed,
  type DotShape,
  type GradientDirection,
} from "@/store/slices/decorateSlice";
import { DOT_COLORS, DOT_SHAPES, PALETTE_PRESETS } from "@/lib/dotShapes";
import ColorPicker from "./ColorPicker";

type IconComponent = ComponentType<{ className?: string }>;

const SHAPE_ICONS: Record<DotShape, IconComponent> = {
  circle: CircleIcon,
  flower: Flower2,
  character: Type,
  diamond: Diamond,
  heart: Heart,
  star: Star,
  crown: Crown,
  leaf: Leaf,
  crescent: Moon,
  snowflake: Snowflake,
};

export default function DotControls() {
  const dispatch = useAppDispatch();
  const dotConfig = useAppSelector((s) => s.decorate.dotConfig);
  const [pickerOpen, setPickerOpen] = useState<"single" | "grad1" | "grad2" | null>(null);
  const [spinning, setSpinning] = useState(false);
  const shapeTileRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const colorMode = dotConfig.colorMode;
  const isCustomSingleColor =
    colorMode === "single" && !DOT_COLORS.some((c) => c.value === dotConfig.color);

  useEffect(() => {
    const el = shapeTileRefs.current[dotConfig.shape];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [dotConfig.shape]);

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      {/* Shape */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Shape</label>
          <button
            type="button"
            onClick={() => {
              dispatch(rerollSeed());
              setSpinning(true);
            }}
            onAnimationEnd={() => setSpinning(false)}
            className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg transition-colors text-[#C5E89A] bg-[#E8F5D2] hover:bg-[#d5edba] text-[11px] font-medium"
          >
            <Shuffle className={`w-3.5 h-3.5 shrink-0 ${spinning ? "animate-spin-once" : ""}`} />
            Shuffle
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {DOT_SHAPES.map((s) => {
            const Icon = SHAPE_ICONS[s.value];
            const selected = dotConfig.shape === s.value;
            return (
              <button
                key={s.value}
                ref={(el) => {
                  shapeTileRefs.current[s.value] = el;
                }}
                type="button"
                onClick={() => dispatch(setDotShape(s.value))}
                aria-label={s.label}
                title={s.label}
                aria-pressed={selected}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                style={
                  selected
                    ? {
                        border: "1.5px solid #C5E89A",
                        background: "#E8F5D2",
                        color: "#C5E89A",
                      }
                    : {
                        border: "1.5px solid #D2EAAA",
                        background: "white",
                        color: "#9CA3AF",
                      }
                }
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Character input */}
      {dotConfig.shape === "character" && (
        <div>
          <label className="block text-[11px] uppercase mb-2 text-[#64748b] tracking-[0.08em]">
            Character
          </label>
          <input
            type="text"
            value={dotConfig.character}
            onChange={(e) => dispatch(setCharacter(e.target.value))}
            placeholder="A"
            className="w-full px-3 py-2 rounded-lg text-[14px] text-[#1a1a2e] text-center outline-none transition-colors bg-white border border-[#D2EAAA] focus:border-[#C5E89A]"
          />
        </div>
      )}

      {/* Count */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Count</label>
          <span className="text-[12px] tabular-nums text-[#64748b]">{dotConfig.count}</span>
        </div>
        <Slider min={0} max={100} step={1} value={[dotConfig.count]} onValueChange={(v) => dispatch(setDotCount(v[0]))} />
      </div>

      {/* Size */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Size</label>
          <span className="text-[12px] tabular-nums text-[#64748b]">{Math.round(dotConfig.size * 2)}</span>
        </div>
        <Slider min={0} max={100} step={1} value={[Math.round(dotConfig.size * 2)]} onValueChange={(v) => dispatch(setDotSize(v[0] / 2))} />
      </div>

      {/* Variance */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Variance</label>
          <span className="text-[12px] tabular-nums text-[#64748b]">{dotConfig.variance}</span>
        </div>
        <Slider min={0} max={100} step={1} value={[dotConfig.variance]} onValueChange={(v) => dispatch(setDotVariance(v[0]))} />
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Opacity</label>
          <span className="text-[12px] tabular-nums text-[#64748b]">{dotConfig.opacity}</span>
        </div>
        <Slider min={0} max={100} step={1} value={[dotConfig.opacity]} onValueChange={(v) => dispatch(setDotOpacity(v[0]))} />
      </div>

      {/* Color */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Color</label>

        {/* Mode selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {(["auto", "single", "palette", "gradient"] as const).map((mode) => {
            const labels: Record<string, string> = {
              auto: "Auto",
              single: "Single",
              palette: "Palette",
              gradient: "Gradient",
            };
            const selected = colorMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  dispatch(setDotColorMode(mode));
                  setPickerOpen(null);
                }}
                className="min-h-[36px] py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                style={{
                  color: selected ? "#C5E89A" : "#64748b",
                  background: selected ? "#E8F5D2" : "#F4FAE8",
                  boxShadow: selected
                    ? "#C5E89A 0px 0px 0px 1.5px"
                    : "#D2EAAA 0px 0px 0px 1px",
                }}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* Single mode */}
        {colorMode === "single" && (
          <>
            <div className="grid grid-cols-6 gap-2">
              {DOT_COLORS.map((c) => {
                const selected = dotConfig.color === c.value && pickerOpen !== "single";
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      dispatch(setDotColor(c.value));
                      setPickerOpen(null);
                    }}
                    aria-label={c.label}
                    className="aspect-square rounded-full transition-all"
                    style={{
                      backgroundColor: c.value,
                      boxShadow: selected
                        ? "#C5E89A 0px 0px 0px 2px, rgba(197,232,154,0.25) 0px 0px 0px 4px"
                        : "rgba(0,0,0,0.08) 0px 0px 0px 1px",
                    }}
                  />
                );
              })}
              <button
                type="button"
                onClick={() => setPickerOpen((v) => (v === "single" ? null : "single"))}
                aria-label="Custom color"
                className="aspect-square rounded-full transition-all"
                style={{
                  background: "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                  boxShadow: isCustomSingleColor || pickerOpen === "single"
                    ? "#C5E89A 0px 0px 0px 2px, rgba(197,232,154,0.25) 0px 0px 0px 4px"
                    : "rgba(0,0,0,0.08) 0px 0px 0px 1px",
                }}
              />
            </div>
            {pickerOpen === "single" && (
              <ColorPicker
                color={dotConfig.color}
                onChange={(hex) => dispatch(setDotColor(hex))}
              />
            )}
          </>
        )}

        {/* Palette mode */}
        {colorMode === "palette" && (
          <div className="flex flex-col gap-2">
            {PALETTE_PRESETS.map((preset) => {
              const selected = dotConfig.paletteId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => dispatch(setDotPaletteId(preset.id))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: selected ? "#E8F5D2" : "white",
                    boxShadow: selected
                      ? "#C5E89A 0px 0px 0px 1.5px"
                      : "#D2EAAA 0px 0px 0px 1px",
                  }}
                >
                  <div className="flex gap-1">
                    {preset.colors.map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[12px]"
                    style={{ color: selected ? "#C5E89A" : "#64748b" }}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Gradient mode */}
        {colorMode === "gradient" && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-1.5">
              {(["x", "y", "radial"] as GradientDirection[]).map((dir) => {
                const labels: Record<GradientDirection, string> = {
                  x: "Horizontal",
                  y: "Vertical",
                  radial: "Radial",
                };
                const sel = dotConfig.gradientDirection === dir;
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => dispatch(setDotGradientDirection(dir))}
                    className="flex-1 min-h-[36px] py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                    style={{
                      color: sel ? "#C5E89A" : "#64748b",
                      background: sel ? "#E8F5D2" : "#F4FAE8",
                      boxShadow: sel
                        ? "#C5E89A 0px 0px 0px 1.5px"
                        : "#D2EAAA 0px 0px 0px 1px",
                    }}
                  >
                    {labels[dir]}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              {(["grad1", "grad2"] as const).map((key) => {
                const color = key === "grad1" ? dotConfig.gradientColor1 : dotConfig.gradientColor2;
                const label = key === "grad1" ? "Start" : "End";
                const isOpen = pickerOpen === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPickerOpen((v) => (v === key ? null : key))}
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: "white",
                      boxShadow: isOpen
                        ? "#C5E89A 0px 0px 0px 1.5px"
                        : "#D2EAAA 0px 0px 0px 1px",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] text-[#64748b]">{label}</span>
                  </button>
                );
              })}
            </div>
            {pickerOpen === "grad1" && (
              <ColorPicker
                color={dotConfig.gradientColor1}
                onChange={(hex) => dispatch(setDotGradientColor1(hex))}
              />
            )}
            {pickerOpen === "grad2" && (
              <ColorPicker
                color={dotConfig.gradientColor2}
                onChange={(hex) => dispatch(setDotGradientColor2(hex))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
