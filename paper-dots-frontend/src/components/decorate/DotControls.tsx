"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
    ChevronDown,
    ChevronUp,
    Circle as CircleIcon,
    Droplet,
    Heart,
    Hexagon,
    Leaf,
    Moon,
    Shuffle,
    Square as SquareIcon,
    Star,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setDotShape,
    setDotCount,
    setDotSize,
    setDotVariance,
    setDotColor,
    rerollSeed,
    type DotShape,
} from "@/store/slices/decorateSlice";
import { DOT_COLORS, DOT_SHAPES } from "@/lib/dotShapes";

type IconComponent = ComponentType<{ className?: string }>;

const SHAPE_ICONS: Record<DotShape, IconComponent> = {
    circle: CircleIcon,
    square: SquareIcon,
    teardrop: Droplet,
    heart: Heart,
    star: Star,
    hexagon: Hexagon,
    leaf: Leaf,
    crescent: Moon,
};

export default function DotControls() {
    const dispatch = useAppDispatch();
    const dotConfig = useAppSelector((s) => s.decorate.dotConfig);
    const [isOpen, setIsOpen] = useState(true);
    const shapeTileRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    // Keep the selected shape tile visible whenever it changes (or on mount).
    useEffect(() => {
        if (!isOpen) return;
        const el = shapeTileRefs.current[dotConfig.shape];
        if (el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [dotConfig.shape, isOpen]);

    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
            >
                <span
                    className="text-[13px] font-medium text-white"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                    Dots
                </span>
                {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                )}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-5">
                    {/* Reroll */}
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => dispatch(rerollSeed())}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[100px] text-[13px] font-medium text-white transition-colors"
                            style={{
                                fontFamily: "var(--font-inter), system-ui, sans-serif",
                                background: "rgba(255,255,255,0.08)",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background =
                                    "rgba(255,255,255,0.14)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background =
                                    "rgba(255,255,255,0.08)";
                            }}
                        >
                            <Shuffle className="w-3.5 h-3.5" />
                            Reroll
                        </button>
                    </div>

                    {/* Shape */}
                    <div>
                        <label
                            className="block text-[11px] uppercase mb-2"
                            style={{
                                fontFamily: "var(--font-inter), system-ui, sans-serif",
                                color: "#a6a6a6",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Shape
                        </label>
                        <div
                            className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                WebkitMaskImage:
                                    "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
                                maskImage:
                                    "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
                                paddingInline: "4px",
                            }}
                        >
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
                                        className="shrink-0 snap-center w-11 h-11 rounded-[8px] flex items-center justify-center transition-all"
                                        style={
                                            selected
                                                ? {
                                                      border: "1px solid #0099ff",
                                                      background: "rgba(0,153,255,0.1)",
                                                      color: "#ffffff",
                                                  }
                                                : {
                                                      border: "1px solid rgba(255,255,255,0.1)",
                                                      background: "#090909",
                                                      color: "#a6a6a6",
                                                  }
                                        }
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Count */}
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <label
                                className="text-[11px] uppercase"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Count
                            </label>
                            <span
                                className="text-[12px] tabular-nums"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                }}
                            >
                                {dotConfig.count}
                            </span>
                        </div>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[dotConfig.count]}
                            onValueChange={(v) => dispatch(setDotCount(v[0]))}
                        />
                    </div>

                    {/* Size */}
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <label
                                className="text-[11px] uppercase"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Size
                            </label>
                            <span
                                className="text-[12px] tabular-nums"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                }}
                            >
                                {Math.round(dotConfig.size * 2)}
                            </span>
                        </div>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[Math.round(dotConfig.size * 2)]}
                            onValueChange={(v) => dispatch(setDotSize(v[0] / 2))}
                        />
                    </div>

                    {/* Variance */}
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <label
                                className="text-[11px] uppercase"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Variance
                            </label>
                            <span
                                className="text-[12px] tabular-nums"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                }}
                            >
                                {dotConfig.variance}
                            </span>
                        </div>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[dotConfig.variance]}
                            onValueChange={(v) => dispatch(setDotVariance(v[0]))}
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label
                            className="block text-[11px] uppercase mb-2"
                            style={{
                                fontFamily: "var(--font-inter), system-ui, sans-serif",
                                color: "#a6a6a6",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Color
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {DOT_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => dispatch(setDotColor(c.value))}
                                    aria-label={c.label}
                                    className="aspect-square rounded-full transition-all"
                                    style={{
                                        backgroundColor: c.value,
                                        ...(dotConfig.color === c.value
                                            ? {
                                                  boxShadow:
                                                      "rgba(0, 153, 255, 0.9) 0px 0px 0px 2px, rgba(0, 153, 255, 0.25) 0px 0px 0px 4px",
                                              }
                                            : {
                                                  boxShadow:
                                                      "rgba(255,255,255,0.15) 0px 0px 0px 1px",
                                              }),
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
