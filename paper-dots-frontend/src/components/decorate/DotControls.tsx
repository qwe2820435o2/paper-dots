"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setDotShape,
    setDotDensity,
    setDotSize,
    setDotColor,
    rerollSeed,
    type DotShape,
} from "@/store/slices/decorateSlice";
import { DOT_COLORS, DOT_SHAPES } from "@/lib/dotShapes";

export default function DotControls() {
    const dispatch = useAppDispatch();
    const dotConfig = useAppSelector((s) => s.decorate.dotConfig);
    const [isOpen, setIsOpen] = useState(true);

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
                        <div className="grid grid-cols-3 gap-2">
                            {DOT_SHAPES.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => dispatch(setDotShape(s.value as DotShape))}
                                    className="h-8 text-[13px] rounded-[8px] transition-all"
                                    style={{
                                        fontFamily:
                                            "var(--font-inter), system-ui, sans-serif",
                                        ...(dotConfig.shape === s.value
                                            ? {
                                                  border: "1px solid #0099ff",
                                                  background: "rgba(0,153,255,0.1)",
                                                  color: "#ffffff",
                                              }
                                            : {
                                                  border: "1px solid rgba(255,255,255,0.1)",
                                                  background: "#090909",
                                                  color: "#a6a6a6",
                                              }),
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Density */}
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
                                Density
                            </label>
                            <span
                                className="text-[12px] tabular-nums"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                }}
                            >
                                {Math.round(dotConfig.density * 100)}%
                            </span>
                        </div>
                        <Slider
                            min={10}
                            max={100}
                            step={1}
                            value={[Math.round(dotConfig.density * 100)]}
                            onValueChange={(v) => dispatch(setDotDensity(v[0] / 100))}
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
                                {dotConfig.size}px
                            </span>
                        </div>
                        <Slider
                            min={4}
                            max={48}
                            step={1}
                            value={[dotConfig.size]}
                            onValueChange={(v) => dispatch(setDotSize(v[0]))}
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
