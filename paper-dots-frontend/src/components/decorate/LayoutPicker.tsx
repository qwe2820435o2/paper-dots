"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setLayoutRatio,
    setLayoutType,
    type LayoutType,
} from "@/store/slices/decorateSlice";

const LAYOUT_OPTIONS: { value: LayoutType; label: string }[] = [
    { value: "main-left", label: "Main on Left" },
    { value: "main-right", label: "Main on Right" },
    { value: "main-top", label: "Main on Top" },
    { value: "main-bottom", label: "Main on Bottom" },
    { value: "border", label: "Polaroid Border" },
];

function ratioLabel(type: LayoutType): string {
    if (type === "border") return "Border";
    return "Ratio";
}

export default function LayoutPicker() {
    const dispatch = useAppDispatch();
    const layout = useAppSelector((s) => s.decorate.layout);
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
                    Layout
                </span>
                {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                )}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-5">
                    {/* Stitch type */}
                    <div>
                        <label
                            className="block text-[11px] uppercase mb-2"
                            style={{
                                fontFamily: "var(--font-inter), system-ui, sans-serif",
                                color: "#a6a6a6",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Stitch
                        </label>
                        <div className="relative">
                            <select
                                value={layout.type}
                                onChange={(e) =>
                                    dispatch(setLayoutType(e.target.value as LayoutType))
                                }
                                className="w-full appearance-none px-3 py-2 pr-8 rounded-[8px] text-[13px] text-white outline-none transition-colors cursor-pointer"
                                style={{
                                    fontFamily:
                                        "var(--font-inter), system-ui, sans-serif",
                                    background: "#090909",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                }}
                            >
                                {LAYOUT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: "#a6a6a6" }}
                            />
                        </div>
                    </div>

                    {/* Ratio */}
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <label
                                className="text-[11px] uppercase"
                                style={{
                                    fontFamily:
                                        "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {ratioLabel(layout.type)}
                            </label>
                            <span
                                className="text-[12px] tabular-nums"
                                style={{
                                    fontFamily:
                                        "var(--font-inter), system-ui, sans-serif",
                                    color: "#a6a6a6",
                                }}
                            >
                                {layout.ratio}
                            </span>
                        </div>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[layout.ratio]}
                            onValueChange={(v) => dispatch(setLayoutRatio(v[0]))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
